"use client";

import { buildDashboardChartOptions } from "@/lib/dashboard-chart-options";
import {
  buildByShopChartData,
  buildShopCounts,
  getShopCountForRange,
  getTotalCount,
} from "@/lib/dashboard-metrics";
import { toDateInputValue } from "@/lib/date";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AddShopModal from "../components/dashboard/add-shop-modal";
import ByShopChart from "../components/dashboard/by-shop-chart";
import ConfirmDeleteModal from "../components/dashboard/confirm-delete-modal";
import DateRangeSlider from "../components/dashboard/date-range-slider";
import Footer from "../components/dashboard/footer";
import Header from "../components/dashboard/header";
import ShopsSection from "../components/dashboard/shops-section";
import TrendsChart from "../components/dashboard/trends-chart";
import { useTheme } from "../providers/theme-provider";
import { useUser } from "../providers/user-provider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const EMPTY_SHOPS: readonly BobaShop[] = [];

export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoadingUser, setUserShops } = useUser();
  const { isDark } = useTheme();
  const shops = user?.shops ?? EMPTY_SHOPS;

  const [undoQueueMap, setUndoQueueMap] = useState<Record<string, number>>({});
  const [pendingIncrementMap, setPendingIncrementMap] = useState<
    Record<string, boolean>
  >({});

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingShop, setDeletingShop] = useState<BobaShop | null>(null);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace("/auth");
    }
  }, [isLoadingUser, router, user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    if (!startDate) {
      setStartDate(toDateInputValue(new Date(user.createdAt * 1000)));
    }
    if (!endDate) {
      setEndDate(toDateInputValue(new Date()));
    }
  }, [endDate, startDate, user]);

  const getShopCountForCurrentRange = useCallback(
    (shop: BobaShop) => {
      return getShopCountForRange(shop, startDate, endDate);
    },
    [endDate, startDate],
  );

  const shopCounts = useMemo(
    () => buildShopCounts(shops, startDate, endDate),
    [shops, startDate, endDate],
  );

  const totalCount = useMemo(() => getTotalCount(shopCounts), [shopCounts]);

  const byShopChartData = useMemo(
    () => buildByShopChartData(shopCounts),
    [shopCounts],
  );

  const chartOptions = useMemo(
    () => buildDashboardChartOptions(isDark),
    [isDark],
  );

  const applyShopUpdate = useCallback(
    (updatedShop: BobaShop) => {
      setUserShops((current) =>
        current.map((shop) =>
          shop.id === updatedShop.id ? updatedShop : shop,
        ),
      );
    },
    [setUserShops],
  );

  const requestShopUpdate = useCallback(
    async (
      shopId: number,
      path: "increment" | "undo",
      fallbackError: string,
    ) => {
      const response = await fetch(`/api/shops/${shopId}/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = (await response.json()) as {
        error?: string;
        shop?: BobaShop;
      };

      if (!response.ok || !data.shop) {
        throw new Error(data.error ?? fallbackError);
      }

      applyShopUpdate(data.shop);
    },
    [applyShopUpdate, user?.token],
  );

  async function addDrink(shopId: number) {
    if (!user) {
      return;
    }
    if (pendingIncrementMap[shopId]) {
      return;
    }

    setPendingIncrementMap((current) => ({ ...current, [shopId]: true }));

    try {
      await requestShopUpdate(shopId, "increment", "Could not increment.");
      setUndoQueueMap((current) => ({
        ...current,
        [shopId]: (current[shopId] ?? 0) + 1,
      }));
    } catch {
      toast.error("Could not increment drink count.");
    } finally {
      setPendingIncrementMap((current) => ({ ...current, [shopId]: false }));
    }
  }

  async function undoDrink(shopId: number) {
    if (!user) {
      return;
    }
    if ((undoQueueMap[shopId] ?? 0) <= 0) {
      return;
    }

    try {
      await requestShopUpdate(shopId, "undo", "Could not undo.");
      setUndoQueueMap((current) => ({
        ...current,
        [shopId]: Math.max((current[shopId] ?? 0) - 1, 0),
      }));
    } catch {
      toast.error("Could not undo drink count.");
    }
  }

  function requestDeleteShop(shopId: number) {
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      setDeletingShop(shop);
    }
  }

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tea-white">
        <p className="tea-text-muted text-sm tracking-[0.2em] uppercase">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="tea-grid-bg min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-10 py-16 sm:px-16 lg:px-24">
        <section className="mb-20">
          <DateRangeSlider
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            minDate={
              user
                ? toDateInputValue(new Date(user.createdAt * 1000))
                : startDate
            }
            maxDate={toDateInputValue(new Date())}
          />
        </section>

        <section className="mb-20 text-center">
          <p className="tea-text-accent text-xs tracking-[0.3em] uppercase">
            Total drinks
          </p>
          <p className="tea-text-primary mt-3 font-display text-8xl font-medium tracking-tight sm:text-9xl">
            {totalCount}
          </p>
        </section>

        <div className="tea-line mb-20" />

        <ShopsSection
          shops={shops}
          getShopCountForRange={getShopCountForCurrentRange}
          undoQueueMap={undoQueueMap}
          pendingIncrementMap={pendingIncrementMap}
          onAddDrink={addDrink}
          onUndoDrink={undoDrink}
          onDeleteShop={requestDeleteShop}
          onOpenAddModal={() => setIsModalOpen(true)}
        />

        <div className="tea-line mb-20" />

        <ByShopChart data={byShopChartData} options={chartOptions} />

        <TrendsChart
          shops={shops}
          startDate={startDate}
          endDate={endDate}
          options={chartOptions}
        />
      </main>

      <Footer />

      {deletingShop && (
        <ConfirmDeleteModal
          shop={deletingShop}
          onClose={() => setDeletingShop(null)}
          onDeleted={(shopId) => {
            setUserShops((current) =>
              current.filter((shop) => shop.id !== shopId),
            );
            setDeletingShop(null);
          }}
        />
      )}

      <AddShopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShopAdded={(shop) => {
          setUserShops((current) => [...current, shop]);
        }}
      />
    </div>
  );
}
