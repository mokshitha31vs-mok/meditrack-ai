import os
import urllib.request
import zipfile

model_dir = os.path.expanduser('~/.EasyOCR/model')
os.makedirs(model_dir, exist_ok=True)

urls = [
    ("https://github.com/JaidedAI/EasyOCR/releases/download/pre-v1.1.6/craft_mlt_25k.zip", os.path.join(model_dir, "craft_mlt_25k.zip")),
    ("https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/english_g2.zip", os.path.join(model_dir, "english_g2.zip"))
]

# Fallbacks if 404
craft_fallback = "https://github.com/JaidedAI/EasyOCR/releases/download/v1.0/craft_mlt_25k.zip"

for url, zip_path in urls:
    print(f"Downloading {url} ...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(zip_path, 'wb') as f:
            f.write(resp.read())
    except Exception as e:
        print(f"Primary URL failed ({e}), trying fallback...")
        req = urllib.request.Request(craft_fallback, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(zip_path, 'wb') as f:
            f.write(resp.read())

    print(f"Extracting {zip_path} ...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(model_dir)
    print("Done!")

print("All EasyOCR models ready!")
