import { useState } from 'react';
import { getShichenIndexFromHour } from '@/lib/shichen';
import type { ZiweiData } from '@/types';

interface BirthData {
  birthday: string;
  birthTime: number;
  birthMinute: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  longitude: number;
  isLeap: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_RETRY = 3;
const RETRY_DELAY = 1000;

class ZiweiCache {
  private cache: Map<string, { data: ZiweiData; timestamp: number }>;
  private maxAge: number;

  constructor(maxAge: number = 3600000) {
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  private generateKey(birthData: BirthData, targetYear: number): string {
    return [
      birthData.birthday,
      birthData.birthTime,
      birthData.birthMinute,
      birthData.birthdayType,
      birthData.gender,
      birthData.longitude,
      birthData.isLeap,
      targetYear,
    ].join('_');
  }

  get(birthData: BirthData, targetYear: number): ZiweiData | null {
    const key = this.generateKey(birthData, targetYear);
    const cached = this.cache.get(key);

    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(birthData: BirthData, targetYear: number, data: ZiweiData): void {
    const key = this.generateKey(birthData, targetYear);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    this.cleanup();
  }

  private cleanup(): void {
    const now = Date.now();
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    });
  }
}

const ziweiCache = new ZiweiCache();

export function useZiweiData() {
  const [ziweiData, setZiweiData] = useState<ZiweiData | null>(null);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [horoscopeYear, setHoroscopeYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = async (url: string, options: RequestInit, retryCount: number = 0): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      if (retryCount < MAX_RETRY) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return fetchWithRetry(url, options, retryCount + 1);
      }
      throw err;
    }
  };

  const fetchZiweiData = async (data: BirthData, targetYear: number): Promise<ZiweiData> => {
    const shichenIndex = getShichenIndexFromHour(data.birthTime);
    const response = await fetchWithRetry(`${API_BASE_URL}/api/ziwei`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthday: data.birthday,
        hourIndex: shichenIndex,
        minute: data.birthMinute,
        gender: data.gender,
        isLunar: data.birthdayType === 'lunar',
        isLeap: data.isLeap,
        longitude: data.longitude,
        targetYear,
      }),
    });

    const realZiweiData: ZiweiData = await response.json();
    realZiweiData.originalTime = { hour: data.birthTime, minute: data.birthMinute };

    if (realZiweiData.selectedContext) {
      realZiweiData.selectedContext = {
        ...realZiweiData.selectedContext,
        targetYear,
      };
    }

    return realZiweiData;
  };

  const loadZiweiData = async (data: BirthData): Promise<ZiweiData> => {
    setError(null);
    const targetYear = horoscopeYear;

    try {
      const cachedData = ziweiCache.get(data, targetYear);
      if (cachedData) {
        setZiweiData(cachedData);
        return cachedData;
      }

      const realZiweiData = await fetchZiweiData(data, targetYear);
      ziweiCache.set(data, targetYear, realZiweiData);
      setZiweiData(realZiweiData);
      return realZiweiData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`获取命盘数据失败: ${errorMessage}`);
      throw err;
    }
  };

  const updateHoroscopeYear = async (birthData: BirthData, newYear: number): Promise<ZiweiData> => {
    if (isRefreshingData && ziweiData) return ziweiData;

    setIsRefreshingData(true);
    setError(null);

    try {
      const cachedData = ziweiCache.get(birthData, newYear);
      if (cachedData) {
        setHoroscopeYear(newYear);
        setZiweiData(cachedData);
        return cachedData;
      }

      setHoroscopeYear(newYear);
      const realZiweiData = await fetchZiweiData(birthData, newYear);
      ziweiCache.set(birthData, newYear, realZiweiData);
      setZiweiData(realZiweiData);
      return realZiweiData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`更新命盘数据失败: ${errorMessage}`);
      throw err;
    } finally {
      setIsRefreshingData(false);
    }
  };

  return {
    ziweiData,
    isRefreshingData,
    horoscopeYear,
    error,
    loadZiweiData,
    updateHoroscopeYear,
    setZiweiData,
    setError,
  };
}
