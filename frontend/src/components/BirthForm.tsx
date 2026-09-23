'use client';

import { useEffect, useMemo, useState } from 'react';
import { getShichenFromHour } from '@/lib/shichen';

const STORAGE_KEY = 'ziwei_birth_form_v2';

interface BirthFormProps {
  onDataLoaded: (data: {
    birthday: string;
    birthTime: number;
    birthMinute: number;
    birthdayType: 'solar' | 'lunar';
    gender: 'male' | 'female';
    longitude: number;
    isLeap: boolean;
  }) => void | Promise<void>;
}

interface FormState {
  isLunar: boolean;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  isLeap: boolean;
  selectedCity: string;
  customLongitude: string;
}

const DEFAULT_STATE: FormState = {
  isLunar: false,
  year: 2000,
  month: 5,
  day: 23,
  hour: 10,
  minute: 50,
  gender: 'male',
  isLeap: false,
  selectedCity: 'beijing',
  customLongitude: '',
};

const cities = [
  { value: 'beijing', label: '北京', longitude: 116.41 },
  { value: 'shanghai', label: '上海', longitude: 121.48 },
  { value: 'guangzhou', label: '广州', longitude: 113.27 },
  { value: 'shenzhen', label: '深圳', longitude: 114.07 },
  { value: 'hangzhou', label: '杭州', longitude: 120.2 },
  { value: 'chengdu', label: '成都', longitude: 104.07 },
  { value: 'wuhan', label: '武汉', longitude: 114.31 },
  { value: 'xian', label: '西安', longitude: 108.95 },
  { value: 'custom', label: '自定义', longitude: 0 },
];

export default function BirthForm({ onDataLoaded }: BirthFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch (error) {
      console.error('加载表单缓存失败:', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const getLongitude = (): number => {
    if (form.selectedCity === 'custom' && form.customLongitude) {
      return Number.parseFloat(form.customLongitude) || 120.033;
    }
    const city = cities.find((item) => item.value === form.selectedCity);
    return city ? city.longitude : 120.033;
  };

  const isValidDate = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const isValidLongitude = (longitude: string): boolean => {
    const num = Number.parseFloat(longitude);
    return !Number.isNaN(num) && num >= -180 && num <= 180;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!isValidDate(form.year, form.month, form.day)) {
      newErrors.date = '请选择有效的日期';
    }

    if (form.selectedCity === 'custom') {
      if (!form.customLongitude) {
        newErrors.longitude = '请输入经度值';
      } else if (!isValidLongitude(form.customLongitude)) {
        newErrors.longitude = '经度需在 -180 到 180 之间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const shichen = useMemo(() => getShichenFromHour(form.hour), [form.hour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setJustSubmitted(true);

    try {
      const birthday = `${form.year}-${form.month}-${form.day}`;
      const birthdayType = form.isLunar ? 'lunar' : 'solar';
      const longitude = getLongitude();

      await onDataLoaded({
        birthday,
        birthTime: form.hour,
        birthMinute: form.minute,
        birthdayType,
        gender: form.gender,
        longitude,
        isLeap: form.isLeap,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setJustSubmitted(false), 2000);
    }
  };

  const years = Array.from({ length: 100 }, (_, i) => 2026 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <form onSubmit={handleSubmit} className="fp-birth-form-fields space-y-4">
      {justSubmitted && (
        <div className="fp-form-submitted rounded-lg text-xs px-3 py-2">
          已提交，正在排盘中。请稍候，表单信息已保留。
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">选择历法</label>
        <div className="flex gap-2">
          <label className={`fp-choice-pill flex items-center cursor-pointer px-3 py-2 rounded-lg transition-all text-sm ${!form.isLunar ? 'is-selected' : ''}`}>
            <input
              type="radio"
              checked={!form.isLunar}
              onChange={() => setForm((prev) => ({ ...prev, isLunar: false }))}
              className="mr-2"
            />
            <span>阳历（推荐）</span>
          </label>
          <label className={`fp-choice-pill flex items-center cursor-pointer px-3 py-2 rounded-lg transition-all text-sm ${form.isLunar ? 'is-selected' : ''}`}>
            <input
              type="radio"
              checked={form.isLunar}
              onChange={() => setForm((prev) => ({ ...prev, isLunar: true }))}
              className="mr-2"
            />
            <span>农历</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">出生日期</label>
        <div className="flex gap-1 flex-wrap">
          <select
            value={form.year}
            onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
            className={`fp-form-select flex-1 min-w-[90px] p-2 rounded-lg focus:outline-none transition-all text-sm ${errors.date ? 'has-error' : ''}`}
          >
            {years.map((year) => (
              <option key={year} value={year} className="text-gray-900 dark:text-gray-100">
                {year}年
              </option>
            ))}
          </select>
          <select
            value={form.month}
            onChange={(e) => setForm((prev) => ({ ...prev, month: Number(e.target.value) }))}
            className={`fp-form-select flex-1 min-w-[60px] p-2 rounded-lg focus:outline-none transition-all text-sm ${errors.date ? 'has-error' : ''}`}
          >
            {months.map((month) => (
              <option key={month} value={month} className="text-gray-900 dark:text-gray-100">
                {month}月
              </option>
            ))}
          </select>
          <select
            value={form.day}
            onChange={(e) => setForm((prev) => ({ ...prev, day: Number(e.target.value) }))}
            className={`fp-form-select flex-1 min-w-[60px] p-2 rounded-lg focus:outline-none transition-all text-sm ${errors.date ? 'has-error' : ''}`}
          >
            {days.map((day) => (
              <option key={day} value={day} className="text-gray-900 dark:text-gray-100">
                {day}日
              </option>
            ))}
          </select>
        </div>
        {errors.date && <p className="text-xs text-red-500 dark:text-red-400">{errors.date}</p>}
      </div>

      {form.isLunar && (
        <div className="fp-form-note fp-form-note-warm flex items-center p-2 rounded-lg">
          <input
            type="checkbox"
            checked={form.isLeap}
            onChange={(e) => setForm((prev) => ({ ...prev, isLeap: e.target.checked }))}
            className="mr-2 w-4 h-4"
          />
          <label className="text-xs font-medium">闰月出生（例如：闰四月）</label>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">出生时间</label>
        <div className="flex items-center gap-1 flex-wrap">
          <select
            value={form.hour}
            onChange={(e) => setForm((prev) => ({ ...prev, hour: Number(e.target.value) }))}
            className="fp-form-select flex-1 min-w-[80px] p-2 rounded-lg focus:outline-none transition-all text-sm"
          >
            {hours.map((hour) => (
              <option key={hour} value={hour} className="text-gray-900 dark:text-gray-100">
                {hour.toString().padStart(2, '0')}时
              </option>
            ))}
          </select>
          <span className="fp-time-separator text-xl font-light">:</span>
          <select
            value={form.minute}
            onChange={(e) => setForm((prev) => ({ ...prev, minute: Number(e.target.value) }))}
            className="fp-form-select flex-1 min-w-[80px] p-2 rounded-lg focus:outline-none transition-all text-sm"
          >
            {minutes.map((minute) => (
              <option key={minute} value={minute} className="text-gray-900 dark:text-gray-100">
                {minute.toString().padStart(2, '0')}分
              </option>
            ))}
          </select>
        </div>

        <div className="fp-form-note fp-form-note-accent p-2 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">对应时辰</span>
            <span className="fp-form-note-value text-sm font-bold">{shichen}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">出生地</label>
        <select
          value={form.selectedCity}
          onChange={(e) => setForm((prev) => ({ ...prev, selectedCity: e.target.value }))}
          className="fp-form-select w-full p-2 rounded-lg focus:outline-none transition-all text-sm"
        >
          {cities.map((city) => (
            <option key={city.value} value={city.value} className="text-gray-900 dark:text-gray-100">
              {city.label}
            </option>
          ))}
        </select>

        {form.selectedCity === 'custom' && (
          <input
            type="text"
            value={form.customLongitude}
            onChange={(e) => setForm((prev) => ({ ...prev, customLongitude: e.target.value }))}
            placeholder="请输入经度（如 116.41）"
            className={`fp-form-select w-full p-2 rounded-lg focus:outline-none transition-all text-sm ${errors.longitude ? 'has-error' : ''}`}
          />
        )}
        {errors.longitude && <p className="text-xs text-red-500 dark:text-red-400">{errors.longitude}</p>}

        <div className="fp-form-note fp-form-note-neutral p-2 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">当前经度</span>
            <span className="fp-form-note-value text-sm font-bold">{getLongitude().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">性别</label>
        <div className="flex gap-2">
          <label className={`fp-choice-pill flex items-center cursor-pointer px-3 py-2 rounded-lg transition-all flex-1 justify-center text-sm ${form.gender === 'female' ? 'is-selected' : ''}`}>
            <input
              type="radio"
              value="female"
              checked={form.gender === 'female'}
              onChange={() => setForm((prev) => ({ ...prev, gender: 'female' }))}
              className="mr-2"
            />
            <span>女</span>
          </label>
          <label className={`fp-choice-pill flex items-center cursor-pointer px-3 py-2 rounded-lg transition-all flex-1 justify-center text-sm ${form.gender === 'male' ? 'is-selected' : ''}`}>
            <input
              type="radio"
              value="male"
              checked={form.gender === 'male'}
              onChange={() => setForm((prev) => ({ ...prev, gender: 'male' }))}
              className="mr-2"
            />
            <span>男</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="fp-form-submit w-full text-white py-3 rounded-xl font-bold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            排盘中...
          </div>
        ) : (
          '开始排盘'
        )}
      </button>
    </form>
  );
}
