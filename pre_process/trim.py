#!/usr/bin/env python3
import os
import sys
import argparse
from pathlib import Path
from PIL import Image
import numpy as np


def parse_args():
    p = argparse.ArgumentParser(
        description="Trim the foreground from images in a directory and save them to a new directory. Accepts a directory of images."
    )
    p.add_argument(
        "input_path", type=Path, help="Path to the input image file or directory."
    )
    p.add_argument("output_dir", type=Path, help="Path to the output directory.")
    return p.parse_args()


def get_foreground_bbox(file, alpha_threshold=10):
    with Image.open(file) as image:
        image = image.convert("RGBA")
        np_image = np.array(image)
        alpha = np_image[..., 3]
        mask = alpha > alpha_threshold

    coords = np.argwhere(mask)
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    print(f"Foreground bounding box for {file}: ({x0}, {y0}, {x1}, {y1})")
    return (x0, y0, x1 + 1, y1 + 1)


def calc_union_bbox(bboxes):
    x0 = min([bbox[0] for bbox in bboxes])
    y0 = min([bbox[1] for bbox in bboxes])
    x1 = max([bbox[2] for bbox in bboxes])
    y1 = max([bbox[3] for bbox in bboxes])
    return (x0, y0, x1, y1)


def main():
    args = parse_args()
    input_path = args.input_path
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

    union_bbox = calc_union_bbox(
        [get_foreground_bbox(file) for file in files_to_process]
    )
    print(f"Union bounding box: {union_bbox}")

    for file in files_to_process:
        with Image.open(file) as image:
            trimmed_image = image.crop(union_bbox)
            output_filename = f"{file.stem}_trimmed{file.suffix}"
            output_path = output_dir / output_filename
            trimmed_image.save(output_path)
            print(f"Trimmed image saved to {output_path}")


if __name__ == "__main__":
    main()
