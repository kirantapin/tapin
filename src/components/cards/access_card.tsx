import { titleCase } from "title-case";

interface CardProps {
  baseColor: string;
  venueName: string;
  title: string;
  savings: string;
  regularPrice: number;
  discountPrice: number;
  date: string;
}

function generateGradientColors(baseColor: string) {
  // Convert hex to RGB
  const r = Number.parseInt(baseColor.slice(1, 3), 16);
  const g = Number.parseInt(baseColor.slice(3, 5), 16);
  const b = Number.parseInt(baseColor.slice(5, 7), 16);

  // Create darker shade for 'from' color (20% darker)
  const darkerShade = `rgb(${r * 0.8}, ${g * 0.8}, ${b * 0.8})`;

  // Create even darker shade for 'to' color (40% darker)
  const darkestShade = `rgb(${r * 0.6}, ${g * 0.6}, ${b * 0.6})`;

  // Create lighter shade for overlay (30% lighter with transparency)
  const lighterShade = `rgba(${Math.min(r * 1.3, 255)}, ${Math.min(
    g * 1.3,
    255
  )}, ${Math.min(b * 1.3, 255)}, 0.2)`;

  return {
    from: darkerShade,
    via: baseColor,
    to: darkestShade,
    overlay: lighterShade,
  };
}

export default function Card({
  baseColor = "#34A853",
  venueName = "Whitlow's DC",
  title = "Happy Hour",
  savings = "Save $1.50 per drink",
  regularPrice = 10,
  discountPrice = 5,
  date = "01/25",
}: CardProps) {
  const colors = generateGradientColors(baseColor);

  return (
    <div className="w-full aspect-[9/5] rounded-3xl p-3 sm:p-4 relative overflow-hidden  text-white my-4">
      <div
        style={{
          background: `linear-gradient(to bottom right, ${colors.from}, ${colors.via}, ${colors.to})`,
        }}
        className="absolute inset-0"
      />

      {/* Circular gradient overlay */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full transform translate-x-20 -translate-y-20"
        style={{
          background: `linear-gradient(to bottom right, ${colors.overlay}, transparent)`,
        }}
      />

      {/* Date in top right corner */}
      <div className="absolute top-3 sm:top-4 right-4 sm:right-6 text-sm text-white/80">
        {date}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="space-y-1 sm:space-y-2">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm text-white/80">{venueName}</p>
            <h2 className="text-xl sm:text-2xl font-semibold">
              {titleCase(title)}
            </h2>
          </div>

          <div className="inline-block bg-white/30 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
            {savings}
          </div>
        </div>

        <div className="flex justify-between items-end mt-auto pt-2">
          <div className="space-y-0.5">
            <p className="text-[10px] sm:text-xs text-white/80">
              Reg. Price: ${regularPrice}
            </p>
            <p className="text-xs sm:text-sm font-semibold">
              Happy Hour: ${discountPrice}
            </p>
          </div>
          <button className="bg-white hover:bg-gray-100 text-black text-xs sm:text-sm font-semibold py-1 sm:py-1.5 px-3 sm:px-4 rounded-full transition-colors duration-200">
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}
