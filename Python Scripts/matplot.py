import json
import matplotlib.pyplot as plt
import argparse
import os

def load_data(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def plot_series(data, output_file="chart_plot.png"):
    # Extract labels and series
    title = data.get("title", "Digitized Chart")
    x_label = data.get("xAxisLabel", "X Axis (Real World Units)")
    y_label = data.get("yAxisLabel", "Y Axis (Real World Units)")
    series_list = data.get("series", [])

    plt.figure(figsize=(12, 8))

    for s in series_list:
        name = s.get("name", "Unnamed")
        color = s.get("color", None)
        points = s.get("points", [])

        x = [pt["real"]["x"] for pt in points if pt.get("real") and pt["real"].get("x") is not None]
        y = [pt["real"]["y"] for pt in points if pt.get("real") and pt["real"].get("y") is not None]

        if x and y:
            plt.plot(x, y, label=name, color=color)

    plt.title(title)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_file)
    print(f"✅ Chart saved as: {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Plot digitized chart data from JSON")
    parser.add_argument("json_file", help="Path to exported JSON file")
    parser.add_argument("--output", help="Output image file", default="chart_plot.png")
    args = parser.parse_args()

    if not os.path.isfile(args.json_file):
        print("❌ Error: JSON file does not exist.")
        return

    try:
        data = load_data(args.json_file)
        plot_series(data, output_file=args.output)
    except Exception as e:
        print(f"❌ Failed to plot chart: {e}")

if __name__ == "__main__":
    main()
