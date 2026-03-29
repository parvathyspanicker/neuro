#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick test: run real model inference on one sample from each class."""

import sys, os, glob
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.MRIAnalysisService import MRIAnalysisService

BASE = r"d:\neuro\datasets\archive (1)\Testing"
CLASSES = ["glioma", "meningioma", "notumor", "pituitary"]

def main():
    print("Initialising service...")
    svc = MRIAnalysisService()
    print(f"Model loaded: {svc.model_path}\n")

    correct = 0
    total = len(CLASSES)

    for cls in CLASSES:
        imgs = glob.glob(os.path.join(BASE, cls, "*"))
        if not imgs:
            print(f"  [SKIP] No images found for {cls}")
            continue

        # Test first image from the class
        result = svc.analyze_mri(imgs[0])
        pred = result["prediction"]
        pred_class = pred["predicted_class"]
        conf = pred["confidence"]

        # Check if prediction matches expected class
        pred_lower = pred_class.lower()
        match = cls in pred_lower or (cls == "notumor" and "normal" in pred_lower)

        status = "[OK]" if match else "[FAIL]"
        if match:
            correct += 1

        print(f"  {status}  Expected: {cls:>12}  |  Got: {pred_class:<35}  ({conf:.2%})")

    print(f"\nResult: {correct}/{total} correct predictions")

if __name__ == "__main__":
    main()
