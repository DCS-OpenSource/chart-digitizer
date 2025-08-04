import json
import matplotlib.pyplot as plt
import argparse
import os

def load_data(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def plot_series(series_list, title="Digitized Chart", output_file="chart_plot.png"):
    plt.figure(figsize=(10, 6))
    for s in series_list:
        x = [pt["real"]["x"] for pt in s["points"] if pt["real"]["x"] is not None]
        y = [pt["real"]["y"] for pt in s["points"] if pt["real"]["y"] is not None]
        plt.plot(x, y, label=s["name"], color=s["color"])

    plt.title(title)
    plt.xlabel("X Axis (Real World Units)")
    plt.ylabel("Y Axis (Real World Units)")
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_file)
    print(f"Chart saved as {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Plot chart from exported JSON")
    parser.add_argument("json_file", help="Path to exported JSON file")
    parser.add_argument("--output", help="Output image filename", default="chart_plot.png")
    args = parser.parse_args()

    if not os.path.exists(args.json_file):
        print("Error: JSON file does not exist.")
        return

    data = load_data(args.json_file)
    plot_series(data, output_file=args.output)

if __name__ == "__main__":
    main()
