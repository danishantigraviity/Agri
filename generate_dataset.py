import os
import argparse
import random
import pandas as pd
from PIL import Image, ImageDraw, ImageFilter
from icrawler.builtin import BingImageCrawler
import time

# Configuration
CLASSES = [
    "Apple Scab", "Apple Black Rot", "Cedar Apple Rust", "Apple Healthy",
    "Corn Common Rust", "Corn Northern Leaf Blight", "Corn Healthy",
    "Potato Early Blight", "Potato Late Blight", "Potato Healthy",
    "Tomato Bacterial Spot", "Tomato Early Blight", "Tomato Late Blight",
    "Tomato Mosaic Virus", "Tomato Yellow Leaf Curl", "Tomato Healthy"
]

BASE_DIR = os.path.join("agrimarket", "ml_service", "dataset")
EXCEL_PATH = "crop_disease_labels.xlsx"

def create_dirs():
    for cls in CLASSES:
        path = os.path.join(BASE_DIR, cls.replace(" ", "_"))
        if not os.path.exists(path):
            os.makedirs(path)

def scrape_images(limit_per_class=10):
    print(f"🚀 Starting Scraping ({limit_per_class} images/class)...")
    for cls in CLASSES:
        print(f"🔍 Searching for: {cls}")
        save_path = os.path.join(BASE_DIR, cls.replace(" ", "_"))
        crawler = BingImageCrawler(storage={'root_dir': save_path})
        crawler.crawl(keyword=f"{cls} leaf disease symptom", max_num=limit_per_class)
    print("✅ Scraping Complete.")

def generate_synthetic_leaf(cls, filename):
    """Generates a pseudo-realistic leaf image using PIL."""
    size = (224, 224)
    # Base leaf color (varying greens)
    base_color = (random.randint(40, 100), random.randint(120, 200), random.randint(30, 80))
    if "Healthy" in cls:
        base_color = (random.randint(30, 60), random.randint(160, 220), random.randint(20, 50))
    
    img = Image.new('RGB', size, base_color)
    draw = ImageDraw.Draw(img)
    
    # Add some leaf veins/texture
    for _ in range(5):
        draw.line([random.randint(0, 224), 0, random.randint(0, 224), 224], fill=(20, 80, 20), width=1)

    # Add disease symptoms
    if "Blight" in cls or "Rot" in cls:
        # Brown/Black necrotic spots
        for _ in range(random.randint(3, 8)):
            x, y = random.randint(20, 200), random.randint(20, 200)
            r = random.randint(10, 40)
            draw.ellipse([x-r, y-r, x+r, y+r], fill=(random.randint(50, 80), random.randint(30, 50), 20))
    
    if "Spot" in cls or "Rust" in cls:
        # Small yellow/orange spots
        spot_color = (200, 150, 0) if "Rust" in cls else (200, 200, 0)
        for _ in range(random.randint(20, 50)):
            x, y = random.randint(10, 210), random.randint(10, 210)
            r = random.randint(2, 5)
            draw.point((x, y), fill=spot_color)

    if "Mosaic" in cls or "Curl" in cls:
        # Yellowish mottling
        for _ in range(10):
            x, y = random.randint(0, 224), random.randint(0, 224)
            r = random.randint(30, 80)
            draw.ellipse([x-r, y-r, x+r, y+r], fill=(180, 180, 0, 50))

    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    img.save(filename)

def generate_synthetic_dataset(limit_per_class=10):
    print(f"🎨 Generating Synthetic Dataset ({limit_per_class} images/class)...")
    for cls in CLASSES:
        save_path = os.path.join(BASE_DIR, cls.replace(" ", "_"))
        for i in range(limit_per_class):
            name = f"synth_{int(time.time())}_{i}.jpg"
            generate_synthetic_leaf(cls, os.path.join(save_path, name))
    print("✅ Synthetic Generation Complete.")

def update_excel():
    print("📊 Updating Excel Labels...")
    data = []
    for cls in CLASSES:
        cls_dir = os.path.join(BASE_DIR, cls.replace(" ", "_"))
        if os.path.exists(cls_dir):
            for f in os.listdir(cls_dir):
                if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                    data.append({
                        "image_id": f,
                        "crop": cls.split(" ")[0],
                        "disease": " ".join(cls.split(" ")[1:]),
                        "path": os.path.join(cls_dir, f)
                    })
    
    df = pd.DataFrame(data)
    df.to_excel(EXCEL_PATH, index=False)
    print(f"✅ Excel updated with {len(df)} records.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["scrape", "synthetic", "both"], required=True)
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    create_dirs()
    
    if args.mode == "scrape":
        scrape_images(args.limit)
    elif args.mode == "synthetic":
        generate_synthetic_dataset(args.limit)
    elif args.mode == "both":
        scrape_images(args.limit // 2)
        generate_synthetic_dataset(args.limit // 2)

    update_excel()
