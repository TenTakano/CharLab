import argparse
import io
from pathlib import Path
from rembg import new_session, remove
from PIL import Image


def parse_args():
    p = argparse.ArgumentParser(
        description="Extract the foreground from an image and save it to a new file. Accepts a file or a directory (processes recursively)."
    )
    p.add_argument(
        "input_file", type=Path, help="Path to the input image file or directory."
    )
    p.add_argument("output_dir", type=Path, help="Path to the output directory.")
    p.add_argument(
        "--model",
        default="isnet-anime",
        help="Model to use for foreground extraction (default: isnet-anime). See rembg documentation for available models. (https://github.com/danielgatis/rembg?tab=readme-ov-file#models)",
    )
    p.add_argument(
        "--angle",
        type=float,
        default=-90,
        help="Angle for image rotation (default: -90).",
    )
    return p.parse_args()


def extract_foreground(img_bytes, model):
    print(f"Extracting foreground using model: {model}")
    session = new_session(model)
    return remove(img_bytes, session=session)


def rotate(image, angle):
    img = Image.open(io.BytesIO(image)).convert("RGBA")
    rotated = img.rotate(angle, expand=True)

    with io.BytesIO() as buffer:
        rotated.save(buffer, format="PNG")
        return buffer.getvalue()


def process_file(file, model, angle):
    try:
        img_bytes = file.read_bytes()
        foreground = extract_foreground(img_bytes, model=model)
        result = rotate(foreground, angle=angle)
        print(f"Processed {file}: completed processing.")
        return result
    except Exception as e:
        print(f"Failed to process file {file}: {e}")
        return None


def main():
    args = parse_args()
    input_path = args.input_file
    output_dir = args.output_dir

    if not input_path.exists():
        print(f"Input {input_path} does not exist.")
        return

    if output_dir.exists():
        if not output_dir.is_dir():
            ans = input(
                f"{output_dir} exists and is not a directory. Do you want to continue? (y/n): "
            )
            if ans.lower() != "n":
                exit("Aborted by user.")
        else:
            if any(output_dir.iterdir()):
                ans = input(
                    f"{output_dir} is not empty. Do you want to continue? (y/n): "
                )
                if ans.lower() != "n":
                    exit("Aborted by user.")

    output_dir.mkdir(parents=True, exist_ok=True)

    files_to_process = []
    if input_path.is_dir():
        files_to_process = [f for f in input_path.rglob("*") if f.is_file()]
    else:
        files_to_process = [input_path]

    success_count = 0
    failed_count = 0

    for file in files_to_process:
        result = process_file(file, model=args.model, angle=args.angle)
        if result:
            if input_path.is_file():
                output_name = f"{file.stem}_extracted{file.suffix}"
                output_path = output_dir / output_name
            else:
                relative = file.relative_to(input_path)
                output_name = f"{relative.stem}_extracted{relative.suffix}"
                output_path = output_dir / relative.parent / output_name
                output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(result)
            success_count += 1
            print(f"Extracted image saved to {output_path}")
        else:
            failed_count += 1
            print(f"Skipping {file} due to processing error.")

    print(f"\nProcessing completed. Success: {success_count}, Failed: {failed_count}")


if __name__ == "__main__":
    main()
