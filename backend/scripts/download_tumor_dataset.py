import os
import sys
import json

def main():
    try:
        import kagglehub  # type: ignore
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": "kagglehub not installed. pip install kagglehub",
            "detail": str(e)
        }))
        sys.exit(1)

    dataset = os.environ.get("KC_DATASET", "masoudnickparvar/brain-tumor-mri-dataset")
    try:
        path = kagglehub.dataset_download(dataset)
        target_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "tumor_subtypes"))
        os.makedirs(target_root, exist_ok=True)
        print(json.dumps({
            "success": True,
            "download_path": path,
            "target_root": target_root
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()



