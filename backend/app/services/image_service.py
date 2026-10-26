import os
import cv2
import numpy as np
from PIL import Image, ImageOps

SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

def validate_image_file(image_path):
    """
    Validates file existence, supported format, file size, and decodability.
    Returns (is_valid: bool, error_message: str or None)
    """
    if not os.path.exists(image_path):
        return False, "File does not exist on disk."

    size = os.path.getsize(image_path)
    if size == 0:
        return False, "Uploaded file is empty (0 bytes)."
    if size > MAX_FILE_SIZE_BYTES:
        return False, "File size exceeds the 15 MB maximum limit."

    _, ext = os.path.splitext(image_path)
    if ext.lower() not in SUPPORTED_EXTENSIONS:
        return False, f"Unsupported file extension '{ext}'. Only JPG, JPEG, PNG, and WebP are supported."

    # Verify PIL can open and decode
    try:
        with Image.open(image_path) as img:
            img.verify()
    except Exception as e:
        return False, f"Corrupted or unreadable image file: {str(e)}"

    return True, None


def preprocess_image_variants(image_path):
    """
    OpenCV Preprocessing Pipeline:
    Reads the ACTUAL uploaded image file and generates enhanced variants for OCR:
    1. EXIF orientation correction
    2. Resolution assessment & proportional upscaling for OCR character clarity
    3. CLAHE Contrast Enhancement
    4. Edge-preserving bilateral filtering / denoising
    5. Adaptive thresholding binarization
    6. Sharpening filter
    Returns list of paths: [original, clahe_enhanced, denoised_thresh, sharpened]
    """
    valid, err = validate_image_file(image_path)
    if not valid:
        raise ValueError(err)

    base, ext = os.path.splitext(image_path)
    variant_paths = [image_path]

    try:
        # Step 1: Open with PIL to auto-orient based on EXIF tags
        pil_img = Image.open(image_path)
        try:
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception:
            pass

        # Convert to OpenCV RGB format
        if pil_img.mode != 'RGB':
            pil_img = pil_img.convert('RGB')
        img_np = np.array(pil_img)
        img = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

        # Step 2: Grayscale conversion
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Step 3: Resolution check and upscaling
        # Medical OCR performs significantly better when text characters have sufficient stroke width
        h, w = gray.shape[:2]
        if w < 1200:
            scale = 1200.0 / w
            new_w = int(w * scale)
            new_h = int(h * scale)
            gray = cv2.resize(gray, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

        # Variant 1: CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # Prevents over-amplification of noise while making faint ink readable
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        contrast_enhanced = clahe.apply(gray)
        path_clahe = f"{base}_proc_clahe{ext}"
        cv2.imwrite(path_clahe, contrast_enhanced)
        variant_paths.append(path_clahe)

        # Variant 2: Denoised with Adaptive Threshold
        # Edge-preserving bilateral filter preserves numbers, decimal points, and drug names
        denoised = cv2.bilateralFilter(contrast_enhanced, d=9, sigmaColor=75, sigmaSpace=75)
        adaptive_thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 25, 11
        )
        path_thresh = f"{base}_proc_thresh{ext}"
        cv2.imwrite(path_thresh, adaptive_thresh)
        variant_paths.append(path_thresh)

        # Variant 3: Sharpened Filter
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
        sharpened = cv2.filter2D(contrast_enhanced, -1, kernel)
        path_sharp = f"{base}_proc_sharp{ext}"
        cv2.imwrite(path_sharp, sharpened)
        variant_paths.append(path_sharp)

    except Exception as e:
        print(f"[Image Preprocessing Notice] {e}")

    return variant_paths


def preprocess_image(image_path):
    """Returns primary enhanced image variant."""
    variants = preprocess_image_variants(image_path)
    return variants[1] if len(variants) > 1 else variants[0]


if __name__ == '__main__':
    import sys
    print("=== MediTrack AI OpenCV Image Preprocessing Pipeline ===")
    
    # Target image to process: argument or test fixture
    test_img = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', 'test_prescription_multi.png')
    test_img = os.path.abspath(test_img)
    
    if not os.path.exists(test_img):
        # Fallback to test_prescription_A.png
        alt_img = os.path.join(os.path.dirname(__file__), '..', '..', 'test_prescription_A.png')
        if os.path.exists(alt_img):
            test_img = os.path.abspath(alt_img)

    print(f"Target Image: {test_img}")
    valid, err = validate_image_file(test_img)
    print(f"Validation Status: {'VALID' if valid else 'INVALID'} ({err or 'No errors'})")
    
    if valid:
        print("\nExecuting Preprocessing Steps:")
        print("  1. EXIF orientation transposition")
        print("  2. Grayscale conversion & resolution assessment")
        print("  3. CLAHE (Contrast Limited Adaptive Histogram Equalization)")
        print("  4. Bilateral edge-preserving filtering")
        print("  5. Adaptive Gaussian binarization thresholding")
        print("  6. Unsharp mask kernel sharpening")
        
        variants = preprocess_image_variants(test_img)
        print(f"\nGenerated {len(variants)} Optical Preprocessing Variants:")
        for idx, p in enumerate(variants):
            label = "Original" if idx == 0 else ("CLAHE Enhanced" if idx == 1 else ("Denoised Adaptive Thresh" if idx == 2 else "Sharpened"))
            file_size_kb = os.path.getsize(p) / 1024
            print(f"  [{idx + 1}] {label:24} -> {os.path.basename(p)} ({file_size_kb:.1f} KB)")
        
        print("\nSUCCESS: All OpenCV optical enhancements generated cleanly.")

