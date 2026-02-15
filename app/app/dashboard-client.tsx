"use client";

import { toDateInputValue } from "@/lib/date";
import {
  DEFAULT_SHOPS,
  type DefaultShopPresetOption,
} from "@/lib/default-shops";
import { BobaShop } from "@/lib/types";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import AddShopModal from "../components/add-shop-modal";
import DashboardFooter from "../components/dashboard-footer";
import DashboardHeader from "../components/dashboard-header";
import DashboardShopsSection from "../components/dashboard-shops-section";
import DateRangeSlider from "../components/date-range-slider";
import { useTheme } from "../providers/theme-provider";
import { useUser } from "../providers/user-provider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Granularity = "year" | "month" | "weekday";
const Y_AXIS_TICK_COUNT = 5;

export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoadingUser, logout: clearAuth, setUserShops } = useUser();
  const { isDark } = useTheme();
  const shops = user?.shops ?? [];
  const [error, setError] = useState("");
  const [undoQueueMap, setUndoQueueMap] = useState<Record<string, number>>({});
  const [pendingIncrementMap, setPendingIncrementMap] = useState<
    Record<string, boolean>
  >({});

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("year");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [newShopAvatarFile, setNewShopAvatarFile] = useState<File | null>(null);
  const [newShopAvatarPreview, setNewShopAvatarPreview] = useState("");
  const [isAddingShop, setIsAddingShop] = useState(false);

  useEffect(() => {
    return () => {
      if (newShopAvatarPreview) {
        URL.revokeObjectURL(newShopAvatarPreview);
      }
    };
  }, [newShopAvatarPreview]);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace("/auth");
    }
  }, [isLoadingUser, router, user]);

  useEffect(() => {
    if (!user) return;
    if (!startDate) {
      setStartDate(toDateInputValue(new Date(user.createdAt)));
    }
    if (!endDate) {
      setEndDate(toDateInputValue(new Date()));
    }
  }, [endDate, startDate, user]);

  const getShopCountForRange = useCallback(
    (shop: BobaShop) => {
      if (!startDate || !endDate) return shop.total;

      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);

      return Object.entries(shop.dates).reduce((sum, [isoDate, count]) => {
        const point = new Date(isoDate);
        if (point >= start && point <= end) {
          return sum + count;
        }
        return sum;
      }, 0);
    },
    [endDate, startDate],
  );

  const shopCounts = useMemo(
    () => shops.map((shop) => ({ shop, count: getShopCountForRange(shop) })),
    [shops, getShopCountForRange],
  );

  const totalCount = useMemo(
    () => shopCounts.reduce((sum, item) => sum + item.count, 0),
    [shopCounts],
  );

  const firstChartData = useMemo(
    () => ({
      labels: shopCounts.map(({ shop }) => shop.name),
      datasets: [
        {
          label: "Drinks",
          data: shopCounts.map(({ count }) => count),
          backgroundColor: "rgba(123, 139, 111, 0.6)",
          borderRadius: 4,
        },
      ],
    }),
    [shopCounts],
  );

  const secondChartData = useMemo(() => {
    const bucketMap: Record<string, number> = {};
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (const shop of shops) {
      for (const [isoDate, count] of Object.entries(shop.dates)) {
        const point = new Date(isoDate);
        const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
        const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null;

        if (start && point < start) continue;
        if (end && point > end) continue;

        let key = "";
        if (granularity === "year") {
          key = String(point.getUTCFullYear());
        } else if (granularity === "month") {
          key = monthLabels[point.getUTCMonth()];
        } else {
          key = weekdayLabels[point.getUTCDay()];
        }

        bucketMap[key] = (bucketMap[key] ?? 0) + count;
      }
    }

    let labels: string[];
    if (granularity === "month") {
      labels = monthLabels;
    } else if (granularity === "weekday") {
      labels = weekdayLabels;
    } else {
      const currentYear = String(new Date().getUTCFullYear());
      const yearLabels = new Set(Object.keys(bucketMap));
      yearLabels.add(currentYear);
      labels = Array.from(yearLabels).sort((a, b) => Number(a) - Number(b));
    }

    const data = labels.map((label) => bucketMap[label] ?? 0);

    return {
      labels,
      datasets: [
        {
          label: `Boba per ${granularity}`,
          data,
          backgroundColor: "rgba(196, 169, 106, 0.6)",
          borderRadius: 4,
        },
      ],
    };
  }, [shops, startDate, endDate, granularity]);

  const chartOptions = useMemo(
    () => ({
      alignToPixels: true,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 0,
      },
      plugins: {
        legend: {
          labels: {
            color: isDark ? "#F1F3F5" : "#1A1A1A",
            font: { family: "Sora, sans-serif", size: 11 },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            display: true,
            color: isDark ? "#93A0AD" : "#B5AFA5",
            font: { family: "Sora, sans-serif", size: 10 },
          },
          grid: { display: false },
          border: {
            display: true,
            color: isDark
              ? "rgba(147, 160, 173, 0.55)"
              : "rgba(212, 207, 199, 0.8)",
            width: 1,
          },
        },
        y: {
          beginAtZero: true,
          afterDataLimits: (scale: { min: number; max: number }) => {
            scale.min = 0;
            const dynamicStep = Math.max(
              1,
              Math.ceil(scale.max / (Y_AXIS_TICK_COUNT - 1)),
            );
            scale.max = dynamicStep * (Y_AXIS_TICK_COUNT - 1);
          },
          ticks: {
            display: true,
            color: isDark ? "#93A0AD" : "#B5AFA5",
            font: { family: "Sora, sans-serif", size: 10 },
            count: Y_AXIS_TICK_COUNT,
            precision: 0,
          },
          grid: { display: false },
          border: {
            display: true,
            color: isDark
              ? "rgba(147, 160, 173, 0.55)"
              : "rgba(212, 207, 199, 0.8)",
            width: 1,
          },
        },
      },
    }),
    [isDark],
  );

  async function addDrink(shopId: string) {
    if (!user) return;
    if (pendingIncrementMap[shopId]) return;

    setPendingIncrementMap((current) => ({ ...current, [shopId]: true }));

    try {
      const response = await fetch(`/api/shops/${shopId}/increment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not increment.");
      }

      setUserShops((current) =>
        current.map((shop) => (shop.id === shopId ? data.shop : shop)),
      );
      setUndoQueueMap((current) => ({
        ...current,
        [shopId]: (current[shopId] ?? 0) + 1,
      }));
    } catch {
      setError("Could not increment drink count.");
    } finally {
      setPendingIncrementMap((current) => ({ ...current, [shopId]: false }));
    }
  }

  async function undoDrink(shopId: string) {
    if (!user) return;
    if ((undoQueueMap[shopId] ?? 0) <= 0) return;

    try {
      const response = await fetch(`/api/shops/${shopId}/undo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not undo.");
      }

      setUserShops((current) =>
        current.map((shop) => (shop.id === shopId ? data.shop : shop)),
      );
      setUndoQueueMap((current) => ({
        ...current,
        [shopId]: Math.max((current[shopId] ?? 0) - 1, 0),
      }));
    } catch {
      setError("Could not undo drink count.");
    }
  }

  async function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Invalid avatar format. Use JPEG, PNG, or WebP.");
      return;
    }

    try {
      if (newShopAvatarPreview) {
        URL.revokeObjectURL(newShopAvatarPreview);
      }
      const nextPreview = URL.createObjectURL(file);
      setNewShopAvatarFile(file);
      setNewShopAvatarPreview(nextPreview);
      setError("");
    } catch {
      setError("Could not process image.");
    }
  }

  async function handleAddShop(event: FormEvent<HTMLFormElement>) {
    if (!user) return;
    event.preventDefault();
    if (!newShopName.trim() || !newShopAvatarPreview) return;

    setIsAddingShop(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", newShopName.trim());
      if (newShopAvatarFile) {
        formData.append("avatar", newShopAvatarFile);
      }

      const response = await fetch("/api/shops", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not create shop.");
      }

      setUserShops((current) => [...current, data.shop as BobaShop]);
      setIsModalOpen(false);
      setNewShopName("");
      setNewShopAvatarFile(null);
      setNewShopAvatarPreview("");
    } catch {
      setError("Could not add boba shop.");
    } finally {
      setIsAddingShop(false);
    }
  }

  function onPresetSelect(preset: DefaultShopPresetOption) {
    if (newShopAvatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(newShopAvatarPreview);
    }
    setNewShopName(preset.name);
    setNewShopAvatarFile(null);
    setNewShopAvatarPreview(preset.avatar);
    setError("");
  }

  function logout() {
    clearAuth();
    router.push("/auth");
  }

  if (isLoadingUser) {
    return (
      <div className="bg-tea-white flex min-h-screen items-center justify-center">
        <p className="tea-text-muted text-sm tracking-[0.2em] uppercase">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="tea-grid-bg min-h-screen">
      <DashboardHeader username={user?.username ?? ""} onLogout={logout} />

      <main className="mx-auto w-full max-w-5xl px-10 py-16 sm:px-16 lg:px-24">
        <section className="mb-20">
          <DateRangeSlider
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            minDate={
              user ? toDateInputValue(new Date(user.createdAt)) : startDate
            }
            maxDate={toDateInputValue(new Date())}
          />
        </section>

        <section className="mb-20 text-center">
          <p className="tea-text-accent text-xs tracking-[0.3em] uppercase">
            Total drinks
          </p>
          <p className="font-display tea-text-primary mt-3 text-8xl font-medium tracking-tight sm:text-9xl">
            {totalCount}
          </p>
        </section>

        <div className="tea-line mb-20" />

        <DashboardShopsSection
          shops={shops}
          getShopCountForRange={getShopCountForRange}
          undoQueueMap={undoQueueMap}
          pendingIncrementMap={pendingIncrementMap}
          onAddDrink={addDrink}
          onUndoDrink={undoDrink}
          onOpenAddModal={() => setIsModalOpen(true)}
        />

        <div className="tea-line mb-20" />

        <section className="mb-20">
          <h2 className="font-display tea-text-primary mb-8 text-xl font-medium tracking-tight">
            By shop
          </h2>
          {shops.length === 0 ? (
            <p className="tea-text-secondary text-sm">
              Add your first shop to start charting.
            </p>
          ) : (
            <div className="h-72 w-full">
              <Bar data={firstChartData} options={chartOptions} />
            </div>
          )}
        </section>

        <section className="mb-20">
          <div className="mb-8 flex flex-wrap items-center gap-8">
            <h2 className="font-display tea-text-primary text-xl font-medium tracking-tight">
              Trends
            </h2>
            <div className="tea-border-subtle flex gap-4 border-b">
              {(["year", "month", "weekday"] as Granularity[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setGranularity(value)}
                  className={`pb-2 text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 ${
                    granularity === value
                      ? "tea-border-strong tea-text-primary border-b-2"
                      : "tea-text-muted tea-hover-text-primary"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          {shops.length === 0 ? (
            <p className="tea-text-secondary text-sm">No data yet.</p>
          ) : (
            <div className="h-72 w-full">
              <Bar data={secondChartData} options={chartOptions} />
            </div>
          )}
        </section>

        {error && (
          <p className="mb-8 text-center text-xs tracking-wide text-red-600">
            {error}
          </p>
        )}
      </main>

      <DashboardFooter />

      <AddShopModal
        isOpen={isModalOpen}
        shopName={newShopName}
        avatar={newShopAvatarPreview}
        presets={DEFAULT_SHOPS}
        isSubmitting={isAddingShop}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddShop}
        onPresetSelect={onPresetSelect}
        onShopNameChange={setNewShopName}
        onAvatarChange={onAvatarChange}
      />
    </div>
  );
}
