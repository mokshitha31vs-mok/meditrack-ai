import os
from PIL import Image, ImageDraw

def create_prescription_image(filename, text_lines, width=900, height=650):
    img = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Draw clinic banner
    draw.rectangle([0, 0, width, 70], fill=(15, 23, 42))
    draw.text((30, 25), "CITY HEALTHCARE CLINIC - PRESCRIPTION", fill=(255, 255, 255))

    # Draw doctor & patient details
    draw.text((30, 85), "Dr. Aris Thorne, MD - Senior Physician            Date: 2026-10-23", fill=(71, 85, 105))
    draw.text((30, 115), "Patient Name: Rahul Sharma, 32 / M                Reg No: MED-8842", fill=(15, 23, 42))
    draw.line([(30, 145), (width - 30, 145)], fill=(226, 232, 240), width=2)

    # Rx Symbol
    draw.text((30, 155), "Rx", fill=(3, 105, 161))

    y = 195
    for line in text_lines:
        draw.text((50, y), line, fill=(15, 23, 42))
        y += 35

    # Doctor signature
    draw.line([(width - 260, height - 60), (width - 40, height - 60)], fill=(100, 116, 139), width=1)
    draw.text((width - 240, height - 50), "Dr. Aris Thorne, MD", fill=(71, 85, 105))

    output_path = os.path.join(os.path.dirname(__file__), filename)
    img.save(output_path)
    print(f"[Created] {output_path}")
    return output_path

if __name__ == '__main__':
    # Image A: Single medicine (Amoxicillin)
    create_prescription_image("test_prescription_A.png", [
        "1. Amoxicillin 500 mg",
        "Take 1 tablet twice daily after food",
        "Duration: 5 days",
        "Qty: 10 tablets"
    ], height=500)

    # Image B: Single medicine (Azithromycin)
    create_prescription_image("test_prescription_B.png", [
        "1. Azithromycin 250 mg",
        "Take 1 capsule once daily before food",
        "Duration: 3 days",
        "Qty: 3 capsules"
    ], height=500)

    # Image Multi: 3 distinct medicines with different instructions & strengths
    create_prescription_image("test_prescription_multi.png", [
        "1. Amoxicillin 500 mg",
        "Take 1 capsule twice daily after food for 5 days",
        "Qty: 10 capsules",
        "",
        "2. Paracetamol 650 mg",
        "Take 1 tablet as needed (SOS) for fever",
        "Duration: 3 days",
        "",
        "3. Cetirizine 10 mg",
        "Take 1 tablet once daily at bedtime for 7 days"
    ], height=650)
