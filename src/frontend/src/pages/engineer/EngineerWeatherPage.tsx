import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  XCircle,
} from "lucide-react";

interface DayForecast {
  day: string;
  date: string;
  condition:
    | "clear"
    | "cloudy"
    | "rain"
    | "drizzle"
    | "storm"
    | "partly_cloudy";
  tempHigh: number;
  tempLow: number;
  rainChance: number;
  windSpeed: number;
  humidity: number;
}

const FORECAST: DayForecast[] = [
  {
    day: "Today",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    condition: "partly_cloudy" as DayForecast["condition"],
    tempHigh: 34,
    tempLow: 24,
    rainChance: 20,
    windSpeed: 12,
    humidity: 58,
  },
  {
    day: "Tomorrow",
    date: new Date(Date.now() + 86400000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    condition: "drizzle",
    tempHigh: 29,
    tempLow: 22,
    rainChance: 65,
    windSpeed: 18,
    humidity: 78,
  },
  {
    day: new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-IN", {
      weekday: "short",
    }),
    date: new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    condition: "rain",
    tempHigh: 27,
    tempLow: 21,
    rainChance: 85,
    windSpeed: 22,
    humidity: 88,
  },
  {
    day: new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-IN", {
      weekday: "short",
    }),
    date: new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    condition: "clear",
    tempHigh: 33,
    tempLow: 23,
    rainChance: 10,
    windSpeed: 10,
    humidity: 52,
  },
];

function getConditionIcon(condition: string, size = "w-8 h-8") {
  const props = { className: size };
  switch (condition) {
    case "clear":
      return <Sun {...props} className={`${size} text-amber-500`} />;
    case "rain":
      return <CloudRain {...props} className={`${size} text-blue-500`} />;
    case "drizzle":
      return <CloudDrizzle {...props} className={`${size} text-blue-400`} />;
    case "storm":
      return (
        <CloudLightning {...props} className={`${size} text-purple-500`} />
      );
    default:
      return <Cloud {...props} className={`${size} text-slate-400`} />;
  }
}

function getWorkStatus(forecast: DayForecast): {
  label: string;
  color: string;
  icon: React.ReactNode;
  advice: string;
} {
  if (forecast.rainChance >= 75 || forecast.condition === "storm") {
    return {
      label: "Unsafe to Work",
      color: "bg-red-100 border-red-300 text-red-700",
      icon: <XCircle className="w-4 h-4" />,
      advice:
        "Heavy rain/storm expected. Halt outdoor construction. Secure materials and equipment.",
    };
  }
  if (forecast.rainChance >= 50 || forecast.condition === "drizzle") {
    return {
      label: "Caution",
      color: "bg-amber-100 border-amber-300 text-amber-800",
      icon: <AlertTriangle className="w-4 h-4" />,
      advice:
        "Light rain possible. Use waterproof covers for materials. Monitor conditions every 2 hours.",
    };
  }
  return {
    label: "Safe to Work",
    color: "bg-green-100 border-green-300 text-green-700",
    icon: <CheckCircle2 className="w-4 h-4" />,
    advice: "Good working conditions. Proceed with all planned activities.",
  };
}

export default function EngineerWeatherPage() {
  const today = FORECAST[0];
  const todayStatus = getWorkStatus(today);

  return (
    <div
      className="p-4 space-y-5 bg-slate-50 min-h-screen"
      data-ocid="engineer-weather.page"
    >
      <div className="flex items-center gap-2">
        <Cloud className="w-5 h-5 text-sky-500" />
        <h1 className="font-display text-xl font-bold text-slate-800">
          Weather Advisory
        </h1>
      </div>

      {/* Today's main card */}
      <Card
        className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-5 border-0 shadow-lg text-white"
        data-ocid="engineer-weather.today-card"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sky-100 text-sm font-medium">Today's Weather</p>
            <p className="text-white font-display text-4xl font-bold mt-1">
              {today.tempHigh}°C
            </p>
            <p className="text-sky-200 text-sm mt-0.5">Low {today.tempLow}°C</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getConditionIcon(today.condition, "w-12 h-12")}
            <span className="text-sky-100 text-sm capitalize">
              {today.condition === "partly_cloudy"
                ? "Partly Cloudy"
                : today.condition}
            </span>
          </div>
        </div>
        <div className="flex gap-4 mt-4 pt-4 border-t border-sky-400/30">
          <div className="flex items-center gap-1.5 text-sky-100 text-sm">
            <Droplets className="w-4 h-4" />
            {today.humidity}% Humidity
          </div>
          <div className="flex items-center gap-1.5 text-sky-100 text-sm">
            <Wind className="w-4 h-4" />
            {today.windSpeed} km/h
          </div>
          <div className="flex items-center gap-1.5 text-sky-100 text-sm">
            <CloudRain className="w-4 h-4" />
            {today.rainChance}% Rain
          </div>
        </div>
      </Card>

      {/* Work status advisory */}
      <div
        className={`rounded-2xl p-4 border flex items-start gap-3 ${todayStatus.color}`}
        data-ocid="engineer-weather.work-status"
      >
        <div className="flex-shrink-0 mt-0.5">{todayStatus.icon}</div>
        <div>
          <p className="font-semibold text-sm">{todayStatus.label}</p>
          <p className="text-sm mt-0.5 opacity-90">{todayStatus.advice}</p>
        </div>
      </div>

      {/* 3-day forecast */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Next 3 Days Forecast
        </h2>
        <div className="space-y-3">
          {FORECAST.slice(1, 4).map((day, forecastIdx) => {
            const status = getWorkStatus(day);
            return (
              <Card
                key={day.day}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
                data-ocid={`engineer-weather.forecast.item.${forecastIdx + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getConditionIcon(day.condition, "w-9 h-9")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">
                        {day.day}
                      </p>
                      <span className="text-xs text-slate-400">{day.date}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {day.tempHigh}° / {day.tempLow}°
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CloudRain className="w-3 h-3" />
                        {day.rainChance}%
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs border flex items-center gap-1 ${status.color} flex-shrink-0`}
                  >
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* AI suggestions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          AI Safety Suggestions
        </h2>
        <div className="space-y-2">
          {[
            {
              icon: AlertTriangle,
              color: "text-amber-600 bg-amber-100",
              text: "Rain expected day 2 & 3 — schedule concrete pouring and plastering work for today.",
            },
            {
              icon: CheckCircle2,
              color: "text-green-600 bg-green-100",
              text: "Ideal conditions today for steel reinforcement and masonry work.",
            },
            {
              icon: Wind,
              color: "text-sky-600 bg-sky-100",
              text: "Wind speed above 20 km/h on day 3 — avoid scaffolding installation.",
            },
          ].map((tip, tipIdx) => (
            <div
              key={tip.text.slice(0, 30)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-start gap-3"
              data-ocid={`engineer-weather.suggestion.${tipIdx + 1}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${tip.color}`}
              >
                <tip.icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm text-slate-700">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
