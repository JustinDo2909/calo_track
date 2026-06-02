"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";

// ==========================================
// 1. CƠ SỞ DỮ LIỆU THỰC PHẨM & TỰ ĐỘNG MACROS
// ==========================================
// Đã bổ sung Protein (p), Carbs (c), Fat (f) trên mỗi 100g
const rawFoodDatabase = [
  // Thịt (1-10)
  { id: 1, name: "Ức gà (sống)", caloriesPer100g: 165, pricePer100g: 9000, p: 31, c: 0, f: 3.6 },
  { id: 2, name: "Đùi gà (bỏ da)", caloriesPer100g: 177, pricePer100g: 8000, p: 24, c: 0, f: 8 },
  { id: 3, name: "Cánh gà", caloriesPer100g: 203, pricePer100g: 10000, p: 18, c: 0, f: 15 },
  { id: 4, name: "Thịt bò thăn", caloriesPer100g: 250, pricePer100g: 25000, p: 26, c: 0, f: 15 },
  { id: 5, name: "Thịt bò xay", caloriesPer100g: 332, pricePer100g: 20000, p: 14, c: 0, f: 30 },
  { id: 6, name: "Bắp bò", caloriesPer100g: 201, pricePer100g: 22000, p: 34, c: 0, f: 7 },
  { id: 7, name: "Thịt heo nạc", caloriesPer100g: 143, pricePer100g: 15000, p: 26, c: 0, f: 4 },
  { id: 8, name: "Ba rọi heo", caloriesPer100g: 518, pricePer100g: 16000, p: 9, c: 0, f: 53 },
  { id: 9, name: "Sườn heo non", caloriesPer100g: 277, pricePer100g: 18000, p: 15, c: 0, f: 23 },
  { id: 10, name: "Thịt vịt (bỏ da)", caloriesPer100g: 135, pricePer100g: 12000, p: 18, c: 0, f: 6 },
  // Hải sản (11-22)
  { id: 11, name: "Cá hồi", caloriesPer100g: 208, pricePer100g: 45000, p: 20, c: 0, f: 13 },
  { id: 12, name: "Cá ngừ", caloriesPer100g: 130, pricePer100g: 20000, p: 29, c: 0, f: 1 },
  { id: 13, name: "Cá basa", caloriesPer100g: 131, pricePer100g: 8000, p: 15, c: 0, f: 7 },
  { id: 14, name: "Cá điêu hồng", caloriesPer100g: 128, pricePer100g: 7000, p: 26, c: 0, f: 2 },
  { id: 15, name: "Cá lóc", caloriesPer100g: 97, pricePer100g: 10000, p: 21, c: 0, f: 1 },
  { id: 16, name: "Tôm sú", caloriesPer100g: 99, pricePer100g: 30000, p: 24, c: 0, f: 0.3 },
  { id: 17, name: "Tôm thẻ", caloriesPer100g: 71, pricePer100g: 25000, p: 14, c: 1, f: 1 },
  { id: 18, name: "Mực ống", caloriesPer100g: 92, pricePer100g: 28000, p: 16, c: 3, f: 1 },
  { id: 19, name: "Bạch tuộc", caloriesPer100g: 82, pricePer100g: 25000, p: 15, c: 2, f: 1 },
  { id: 20, name: "Cua biển", caloriesPer100g: 87, pricePer100g: 50000, p: 18, c: 0, f: 1.5 },
  { id: 21, name: "Nghêu", caloriesPer100g: 74, pricePer100g: 6000, p: 13, c: 3, f: 1 },
  { id: 22, name: "Hàu", caloriesPer100g: 68, pricePer100g: 15000, p: 7, c: 4, f: 2.5 },
  // Tinh bột (23-36)
  { id: 23, name: "Cơm trắng", caloriesPer100g: 130, pricePer100g: 2000, p: 2.7, c: 28, f: 0.3 },
  { id: 24, name: "Gạo lứt (chưa nấu)", caloriesPer100g: 370, pricePer100g: 4000, p: 8, c: 77, f: 3 },
  { id: 25, name: "Cơm gạo lứt", caloriesPer100g: 111, pricePer100g: 4000, p: 2.6, c: 23, f: 0.9 },
  { id: 26, name: "Yến mạch", caloriesPer100g: 389, pricePer100g: 15000, p: 17, c: 66, f: 7 },
  { id: 27, name: "Khoai lang (luộc)", caloriesPer100g: 86, pricePer100g: 3000, p: 1.6, c: 20, f: 0.1 },
  { id: 28, name: "Khoai tây", caloriesPer100g: 77, pricePer100g: 3500, p: 2, c: 17, f: 0.1 },
  { id: 29, name: "Bánh mì trắng", caloriesPer100g: 265, pricePer100g: 5000, p: 9, c: 49, f: 3 },
  { id: 30, name: "Bánh mì đen/nguyên cám", caloriesPer100g: 259, pricePer100g: 8000, p: 13, c: 43, f: 4 },
  { id: 31, name: "Bún tươi", caloriesPer100g: 110, pricePer100g: 2500, p: 1, c: 25, f: 0 },
  { id: 32, name: "Phở tươi", caloriesPer100g: 108, pricePer100g: 3000, p: 2, c: 24, f: 0 },
  { id: 33, name: "Miến dong", caloriesPer100g: 332, pricePer100g: 6000, p: 0.7, c: 82, f: 0.1 },
  { id: 34, name: "Mì tôm (gói)", caloriesPer100g: 450, pricePer100g: 6000, p: 9, c: 60, f: 20 },
  { id: 35, name: "Bắp (ngô) ngọt", caloriesPer100g: 86, pricePer100g: 4000, p: 3.3, c: 19, f: 1.4 },
  { id: 36, name: "Bánh ướt", caloriesPer100g: 150, pricePer100g: 3000, p: 3, c: 33, f: 0.5 },
  // Trứng & Sữa (37-47)
  { id: 37, name: "Trứng gà (1 quả ~50g)", caloriesPer100g: 155, pricePer100g: 6000, p: 13, c: 1.1, f: 11 },
  { id: 38, name: "Trứng vịt", caloriesPer100g: 185, pricePer100g: 7000, p: 13, c: 1.5, f: 14 },
  { id: 39, name: "Trứng cút", caloriesPer100g: 158, pricePer100g: 10000, p: 13, c: 0.4, f: 11 },
  { id: 40, name: "Sữa chua không đường", caloriesPer100g: 59, pricePer100g: 6000, p: 10, c: 3.6, f: 0.4 },
  { id: 41, name: "Sữa chua có đường", caloriesPer100g: 97, pricePer100g: 6000, p: 3, c: 16, f: 2 },
  { id: 42, name: "Sữa tươi không đường", caloriesPer100g: 42, pricePer100g: 3500, p: 3.4, c: 5, f: 1 },
  { id: 43, name: "Sữa tươi nguyên kem", caloriesPer100g: 62, pricePer100g: 4000, p: 3.2, c: 4.8, f: 3.3 },
  { id: 44, name: "Phô mai con bò cười", caloriesPer100g: 257, pricePer100g: 25000, p: 11, c: 5, f: 21 },
  { id: 45, name: "Whey Protein (Bột)", caloriesPer100g: 379, pricePer100g: 80000, p: 80, c: 5, f: 3 },
  { id: 46, name: "Đậu hũ non", caloriesPer100g: 61, pricePer100g: 3000, p: 5, c: 2, f: 3.5 },
  { id: 47, name: "Đậu hũ chiên", caloriesPer100g: 271, pricePer100g: 5000, p: 16, c: 10, f: 20 },
  // Rau Củ (48-66)
  { id: 48, name: "Bông cải xanh", caloriesPer100g: 34, pricePer100g: 6000, p: 2.8, c: 7, f: 0.4 },
  { id: 49, name: "Bông cải trắng", caloriesPer100g: 25, pricePer100g: 5000, p: 1.9, c: 5, f: 0.3 },
  { id: 50, name: "Rau muống", caloriesPer100g: 19, pricePer100g: 2000, p: 2.6, c: 3.1, f: 0.2 },
  { id: 51, name: "Rau mồng tơi", caloriesPer100g: 14, pricePer100g: 2500, p: 1.2, c: 2.5, f: 0.2 },
  { id: 52, name: "Cải ngọt", caloriesPer100g: 16, pricePer100g: 2500, p: 1.5, c: 3.2, f: 0.2 },
  { id: 53, name: "Cải thìa", caloriesPer100g: 13, pricePer100g: 2500, p: 1.5, c: 2.2, f: 0.2 },
  { id: 54, name: "Bắp cải", caloriesPer100g: 25, pricePer100g: 2000, p: 1.3, c: 6, f: 0.1 },
  { id: 55, name: "Xà lách", caloriesPer100g: 15, pricePer100g: 3000, p: 1.4, c: 2.9, f: 0.2 },
  { id: 56, name: "Cà chua", caloriesPer100g: 18, pricePer100g: 3500, p: 0.9, c: 3.9, f: 0.2 },
  { id: 57, name: "Dưa leo", caloriesPer100g: 15, pricePer100g: 2000, p: 0.7, c: 3.6, f: 0.1 },
  { id: 58, name: "Cà rốt", caloriesPer100g: 41, pricePer100g: 3000, p: 0.9, c: 10, f: 0.2 },
  { id: 59, name: "Bí đỏ", caloriesPer100g: 26, pricePer100g: 2500, p: 1, c: 6.5, f: 0.1 },
  { id: 60, name: "Bí đao", caloriesPer100g: 12, pricePer100g: 2000, p: 0.4, c: 3, f: 0.2 },
  { id: 61, name: "Hành tây", caloriesPer100g: 40, pricePer100g: 3000, p: 1.1, c: 9, f: 0.1 },
  { id: 62, name: "Nấm kim châm", caloriesPer100g: 37, pricePer100g: 8000, p: 2.7, c: 8, f: 0.3 },
  { id: 63, name: "Nấm đùi gà", caloriesPer100g: 43, pricePer100g: 10000, p: 3.3, c: 6, f: 0.4 },
  { id: 64, name: "Nấm hương", caloriesPer100g: 34, pricePer100g: 15000, p: 2.2, c: 7, f: 0.5 },
  { id: 65, name: "Ớt chuông", caloriesPer100g: 20, pricePer100g: 6000, p: 0.9, c: 4.6, f: 0.2 },
  { id: 66, name: "Đậu cô ve", caloriesPer100g: 31, pricePer100g: 4000, p: 1.8, c: 7, f: 0.2 },
  // Trái Cây (67-81)
  { id: 67, name: "Chuối", caloriesPer100g: 89, pricePer100g: 2500, p: 1.1, c: 23, f: 0.3 },
  { id: 68, name: "Táo", caloriesPer100g: 52, pricePer100g: 8000, p: 0.3, c: 14, f: 0.2 },
  { id: 69, name: "Cam", caloriesPer100g: 47, pricePer100g: 4000, p: 0.9, c: 12, f: 0.1 },
  { id: 70, name: "Bưởi", caloriesPer100g: 38, pricePer100g: 5000, p: 0.7, c: 9.6, f: 0.1 },
  { id: 71, name: "Dưa hấu", caloriesPer100g: 30, pricePer100g: 2000, p: 0.6, c: 7.6, f: 0.2 },
  { id: 72, name: "Bơ", caloriesPer100g: 160, pricePer100g: 9000, p: 2, c: 8.5, f: 15 },
  { id: 73, name: "Đu đủ", caloriesPer100g: 43, pricePer100g: 3000, p: 0.5, c: 11, f: 0.3 },
  { id: 74, name: "Xoài chín", caloriesPer100g: 60, pricePer100g: 5000, p: 0.8, c: 15, f: 0.4 },
  { id: 75, name: "Thanh long", caloriesPer100g: 60, pricePer100g: 4000, p: 1.2, c: 13, f: 0.5 },
  { id: 76, name: "Dâu tây", caloriesPer100g: 32, pricePer100g: 25000, p: 0.7, c: 7.7, f: 0.3 },
  { id: 77, name: "Nho đen/xanh", caloriesPer100g: 69, pricePer100g: 15000, p: 0.7, c: 18, f: 0.2 },
  { id: 78, name: "Ổi", caloriesPer100g: 68, pricePer100g: 3000, p: 2.6, c: 14, f: 1 },
  { id: 79, name: "Kiwi", caloriesPer100g: 61, pricePer100g: 20000, p: 1.1, c: 15, f: 0.5 },
  { id: 80, name: "Sầu riêng", caloriesPer100g: 147, pricePer100g: 25000, p: 1.5, c: 27, f: 5 },
  { id: 81, name: "Mít", caloriesPer100g: 95, pricePer100g: 8000, p: 1.7, c: 23, f: 0.6 },
  // Hạt & Chất béo (82-90)
  { id: 82, name: "Hạt hạnh nhân", caloriesPer100g: 579, pricePer100g: 45000, p: 21, c: 22, f: 50 },
  { id: 83, name: "Hạt điều", caloriesPer100g: 553, pricePer100g: 35000, p: 18, c: 30, f: 44 },
  { id: 84, name: "Đậu phộng (Lạc)", caloriesPer100g: 567, pricePer100g: 10000, p: 26, c: 16, f: 49 },
  { id: 85, name: "Hạt óc chó", caloriesPer100g: 654, pricePer100g: 60000, p: 15, c: 14, f: 65 },
  { id: 86, name: "Hạt chia", caloriesPer100g: 486, pricePer100g: 30000, p: 17, c: 42, f: 31 },
  { id: 87, name: "Hạt dẻ cười", caloriesPer100g: 562, pricePer100g: 50000, p: 20, c: 28, f: 45 },
  { id: 88, name: "Bơ đậu phộng", caloriesPer100g: 588, pricePer100g: 20000, p: 25, c: 20, f: 50 },
  { id: 89, name: "Dầu oliu", caloriesPer100g: 884, pricePer100g: 30000, p: 0, c: 0, f: 100 },
  { id: 90, name: "Mỡ heo", caloriesPer100g: 900, pricePer100g: 10000, p: 0, c: 0, f: 100 },
  // Ăn vặt & Khác (91-107)
  { id: 91, name: "Gà rán KFC/Lotteria", caloriesPer100g: 295, pricePer100g: 25000, p: 14, c: 11, f: 21 },
  { id: 92, name: "Pizza (thập cẩm)", caloriesPer100g: 266, pricePer100g: 30000, p: 11, c: 33, f: 10 },
  { id: 93, name: "Xúc xích heo", caloriesPer100g: 301, pricePer100g: 15000, p: 12, c: 4, f: 26 },
  { id: 94, name: "Lạp xưởng", caloriesPer100g: 604, pricePer100g: 20000, p: 14, c: 15, f: 55 },
  { id: 95, name: "Chả lụa", caloriesPer100g: 136, pricePer100g: 18000, p: 13, c: 4, f: 7 },
  { id: 96, name: "Bánh bao (nhân thịt)", caloriesPer100g: 227, pricePer100g: 15000, p: 7, c: 35, f: 6 },
  { id: 97, name: "Khoai tây chiên", caloriesPer100g: 312, pricePer100g: 15000, p: 3.4, c: 41, f: 15 },
  { id: 98, name: "Trà sữa trân châu", caloriesPer100g: 80, pricePer100g: 10000, p: 1, c: 16, f: 1.5 },
  { id: 99, name: "Cà phê đen (đường)", caloriesPer100g: 20, pricePer100g: 10000, p: 0.1, c: 5, f: 0 },
  { id: 100, name: "Cà phê sữa đá", caloriesPer100g: 95, pricePer100g: 15000, p: 2, c: 14, f: 3 },
  { id: 101, name: "Bánh quy (Cookies)", caloriesPer100g: 502, pricePer100g: 20000, p: 5, c: 68, f: 24 },
  { id: 102, name: "Socola đen (70%)", caloriesPer100g: 598, pricePer100g: 40000, p: 8, c: 46, f: 43 },
  { id: 103, name: "Socola sữa", caloriesPer100g: 535, pricePer100g: 30000, p: 8, c: 59, f: 30 },
  { id: 104, name: "Bia (100ml)", caloriesPer100g: 43, pricePer100g: 4000, p: 0.5, c: 4, f: 0 },
  { id: 105, name: "Nước ngọt (Coca)", caloriesPer100g: 38, pricePer100g: 3000, p: 0, c: 10, f: 0 },
  { id: 106, name: "Trái cây sấy", caloriesPer100g: 359, pricePer100g: 25000, p: 3, c: 83, f: 1 },
  { id: 107, name: "Kẹo dẻo mứt", caloriesPer100g: 350, pricePer100g: 15000, p: 4, c: 83, f: 0.1 },
];

const foodDatabase = rawFoodDatabase.map(food => {
  let cat = "Ăn Vặt & Khác";
  if (food.id <= 10) cat = "Thịt & Gia Cầm";
  else if (food.id <= 22) cat = "Hải Sản";
  else if (food.id <= 36) cat = "Tinh Bột";
  else if (food.id <= 47) cat = "Trứng & Sữa";
  else if (food.id <= 66) cat = "Rau Củ";
  else if (food.id <= 81) cat = "Trái Cây";
  else if (food.id <= 90) cat = "Hạt & Chất Béo";
  return { ...food, category: cat };
});

const FOOD_CATEGORIES = ["Tất cả", "Thịt & Gia Cầm", "Hải Sản", "Tinh Bột", "Trứng & Sữa", "Rau Củ", "Trái Cây", "Hạt & Chất Béo", "Ăn Vặt & Khác"];

const WORKOUT_VIDEOS = [
  { id: "-Tb61HedPDs", title: "10 Phút HIIT Mức Dễ", met: 8.0 },
  { id: "-hSma-BRzoo", title: "20 Phút Đốt Mỡ", met: 8.5 },
  { id: "wIynl3at0Rs", title: "20 Phút Full Body", met: 7.5 },
];

const MEALS = ["Bữa Sáng", "Bữa Trưa", "Bữa Tối", "Ăn Vặt"];
const USER_ACCOUNTS = { Justin: "justin123", Chip: "chip123" };
const getTodayString = () => new Date().toISOString().split("T")[0];

// ==========================================
// CUSTOM HOOKS & CALCULATIONS
// ==========================================
const useDietAnalytics = (globalHistory, user, tdee) => {
  return useMemo(() => {
    if (!user) return { chartData: [], kpis: { daysCount: 0 } };
    const userHistory = globalHistory[user] || {};
    const activeDates = Object.keys(userHistory).filter(date => {
      const dayData = userHistory[date];
      const hasMeals = Object.values(dayData.meals || {}).some(mealArr => mealArr.length > 0);
      const hasWorkouts = (dayData.workouts || []).length > 0;
      return hasMeals || hasWorkouts;
    }).sort(); 

    const recentActiveDates = activeDates.slice(-7);
    let totalDeficit = 0, totalIntake = 0;

    const chartData = recentActiveDates.map((date) => {
      const dayData = userHistory[date];
      let consumed = 0, burned = 0;
      Object.values(dayData.meals || {}).forEach((items) => {
        items.forEach((item) => { consumed += item.calories; });
      });
      (dayData.workouts || []).forEach((w) => { burned += w.calories; });

      const net = consumed - burned;
      totalDeficit += (tdee - net);
      totalIntake += consumed;

      return {
        date: date.substring(5),
        consumed: Math.round(consumed),
        burned: Math.round(burned),
        tdee: Math.round(tdee),
        net: Math.round(net),
      };
    });

    const daysCount = recentActiveDates.length;
    return {
      chartData,
      kpis: {
        weeklyDeficit: Math.round(totalDeficit),
        estimatedWeightLoss: (totalDeficit / 7700).toFixed(2), 
        averageIntake: daysCount > 0 ? Math.round(totalIntake / daysCount) : 0,
        daysCount 
      },
    };
  }, [globalHistory, user, tdee]);
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function UltimateDietTracker() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("Justin");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [globalHistory, setGlobalHistory] = useState({});
  const [profiles, setProfiles] = useState({
    Justin: { weight: 70, height: 175, age: 25, gender: "male", activity: 1.2 },
    Chip: { weight: 50, height: 160, age: 24, gender: "female", activity: 1.2 },
  });

  // State thông báo
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("dietGlobalHistoryV4");
    if (savedHistory) setGlobalHistory(JSON.parse(savedHistory));
    const savedProfiles = localStorage.getItem("dietProfilesV4");
    if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("dietGlobalHistoryV4", JSON.stringify(globalHistory));
      localStorage.setItem("dietProfilesV4", JSON.stringify(profiles));
    }
  }, [globalHistory, profiles, mounted]);

  const userProfile = profiles[user] || {};
  const targetCalories = useMemo(() => {
    if (!userProfile.weight) return 2000;
    let bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age;
    bmr += userProfile.gender === "male" ? 5 : -161;
    return bmr * userProfile.activity;
  }, [userProfile]);

  // Target Macros (30% Protein, 40% Carbs, 30% Fat)
  const targetMacros = useMemo(() => {
    return {
      protein: (targetCalories * 0.30) / 4,
      carbs: (targetCalories * 0.40) / 4,
      fat: (targetCalories * 0.30) / 9,
    };
  }, [targetCalories]);

  const currentDayData = useMemo(() => {
    const dayData = globalHistory[user]?.[selectedDate];
    if (!dayData) return { meals: { "Bữa Sáng": [], "Bữa Trưa": [], "Bữa Tối": [], "Ăn Vặt": [] }, workouts: [] };
    return { meals: dayData.meals || { "Bữa Sáng": [], "Bữa Trưa": [], "Bữa Tối": [], "Ăn Vặt": [] }, workouts: dayData.workouts || [] };
  }, [globalHistory, user, selectedDate]);

  const dailyTotals = useMemo(() => {
    let consumedCalories = 0, cost = 0, burnedCalories = 0;
    let consumedProtein = 0, consumedCarbs = 0, consumedFat = 0;
    
    Object.values(currentDayData.meals).forEach(items => items.forEach(item => { 
      consumedCalories += item.calories; 
      cost += item.cost;
      consumedProtein += item.protein || 0;
      consumedCarbs += item.carbs || 0;
      consumedFat += item.fat || 0;
    }));
    currentDayData.workouts.forEach(w => { burnedCalories += w.calories; });
    
    return { consumedCalories, cost, burnedCalories, consumedProtein, consumedCarbs, consumedFat };
  }, [currentDayData]);

  // Logic hệ thống thông báo
  const notifications = useMemo(() => {
    const notifs = [];
    if (!user || dailyTotals.consumedCalories === 0) return notifs; // Không báo khi chưa ăn gì
    
    // Ngưỡng cảnh báo (ví dụ ăn > 70% lượng calo mà chất đó vẫn thiếu hụt)
    const mealProgress = dailyTotals.consumedCalories / targetCalories;

    if (mealProgress > 0.5) {
      if (dailyTotals.consumedProtein < targetMacros.protein * 0.6) notifs.push({ type: "warning", text: "Bạn đang thiếu Protein trầm trọng! Hãy bổ sung thêm ức gà hoặc trứng." });
      if (dailyTotals.consumedFat > targetMacros.fat * 1.1) notifs.push({ type: "danger", text: "Lượng Chất béo (Fat) đã vượt mức cho phép. Chú ý giảm đồ chiên rán!" });
      if (dailyTotals.consumedCarbs > targetMacros.carbs * 1.2) notifs.push({ type: "danger", text: "Bạn đã nạp quá nhiều Tinh bột (Carbs) hôm nay." });
    }
    
    if (dailyTotals.consumedCalories > targetCalories + 200) notifs.push({ type: "danger", text: "Calo đã vượt mức mục tiêu! Hãy cân nhắc tập luyện thêm." });

    return notifs;
  }, [dailyTotals, targetMacros, targetCalories, user]);

  const remainingCalories = targetCalories - dailyTotals.consumedCalories + dailyTotals.burnedCalories;
  const analyticsData = useDietAnalytics(globalHistory, user, targetCalories);

  const handleLogin = (e) => {
    e.preventDefault();
    if (USER_ACCOUNTS[usernameInput] === passwordInput) { setUser(usernameInput); setLoginError(""); } 
    else setLoginError("Mật khẩu không chính xác!");
  };

  const handleAddMultiple = (meal, draftItems) => {
    const itemsToAdd = Object.entries(draftItems).map(([idStr, grams]) => {
      const food = foodDatabase.find(f => f.id === parseInt(idStr));
      const ratio = grams / 100;
      return {
        id: Date.now() + Math.random(),
        name: food.name,
        grams: grams,
        calories: ratio * food.caloriesPer100g,
        protein: ratio * (food.p || 0),
        carbs: ratio * (food.c || 0),
        fat: ratio * (food.f || 0),
        cost: ratio * food.pricePer100g,
      };
    });

    if (itemsToAdd.length === 0) return;

    setGlobalHistory(prev => {
      const uHist = prev[user] || {};
      const dayData = uHist[selectedDate] || { meals: { "Bữa Sáng": [], "Bữa Trưa": [], "Bữa Tối": [], "Ăn Vặt": [] }, workouts: [] };
      return {
        ...prev,
        [user]: {
          ...uHist,
          [selectedDate]: { ...dayData, meals: { ...dayData.meals, [meal]: [...dayData.meals[meal], ...itemsToAdd] } },
        },
      };
    });
  };

  const handleDeleteItem = (meal, itemId) => {
    setGlobalHistory(prev => {
      const uHist = prev[user] || {};
      const dayData = uHist[selectedDate] || {};
      return {
        ...prev,
        [user]: { ...uHist, [selectedDate]: { ...dayData, meals: { ...dayData.meals, [meal]: dayData.meals[meal].filter(i => i.id !== itemId) } } },
      };
    });
  };

  const handleSaveWorkout = (workout) => {
    setGlobalHistory(prev => {
      const uHist = prev[user] || {};
      const dayData = uHist[selectedDate] || { meals: { "Bữa Sáng": [], "Bữa Trưa": [], "Bữa Tối": [], "Ăn Vặt": [] }, workouts: [] };
      return { ...prev, [user]: { ...uHist, [selectedDate]: { ...dayData, workouts: [...(dayData.workouts || []), workout] } } };
    });
  };

  const handleDeleteWorkout = (workoutId) => {
    setGlobalHistory(prev => {
      const uHist = prev[user] || {};
      const dayData = uHist[selectedDate] || {};
      return { ...prev, [user]: { ...uHist, [selectedDate]: { ...dayData, workouts: dayData.workouts.filter(w => w.id !== workoutId) } } };
    });
  };

  if (!mounted) return null;

  const theme =
    user === "Justin"
      ? {
          bg: "bg-slate-950", card: "bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-xl shadow-cyan-900/10",
          text: "text-cyan-400", textHover: "hover:text-cyan-300",
          border: "border-slate-800", borderSubtle: "border-slate-800/50",
          btn: "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-lg shadow-cyan-600/30 text-white",
          btnOutline: "border border-cyan-700/50 text-cyan-400 hover:bg-cyan-950",
          input: "bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500",
          itemBg: "bg-slate-800/40 hover:bg-slate-800/80", chartColors: { consumed: "#0ea5e9", burned: "#10b981", tdee: "#94a3b8" }
        }
      : {
          bg: "bg-zinc-950", card: "bg-zinc-900/80 backdrop-blur-xl border-zinc-800 shadow-xl shadow-rose-900/10",
          text: "text-rose-400", textHover: "hover:text-rose-300",
          border: "border-zinc-800", borderSubtle: "border-zinc-800/50",
          btn: "bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 shadow-lg shadow-rose-600/30 text-white",
          btnOutline: "border border-rose-700/50 text-rose-400 hover:bg-rose-950",
          input: "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500",
          itemBg: "bg-zinc-800/40 hover:bg-zinc-800/80", chartColors: { consumed: "#f43f5e", burned: "#34d399", tdee: "#a1a1aa" }
        };

  // Dữ liệu cho biểu đồ Radar Macro
  const radarData = [
    { subject: 'Protein (g)', A: Math.round(dailyTotals.consumedProtein), B: Math.round(targetMacros.protein), fullMark: Math.max(dailyTotals.consumedProtein, targetMacros.protein) + 20 },
    { subject: 'Carbs (g)', A: Math.round(dailyTotals.consumedCarbs), B: Math.round(targetMacros.carbs), fullMark: Math.max(dailyTotals.consumedCarbs, targetMacros.carbs) + 20 },
    { subject: 'Fat (g)', A: Math.round(dailyTotals.consumedFat), B: Math.round(targetMacros.fat), fullMark: Math.max(dailyTotals.consumedFat, targetMacros.fat) + 20 },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap'); .hide-scrollbar::-webkit-scrollbar { display: none; }`}} />

      {!user ? (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black flex items-center justify-center p-4">
          <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700/50 transform transition-all hover:scale-[1.01]">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-tight">FITNESS OS</h1>
              <p className="text-slate-400 text-sm mt-2">Hệ thống theo dõi sức khỏe cá nhân (Pro)</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Tài khoản</label>
                <select className="w-full p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500 transition-colors" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}>
                  <option value="Justin">Justin - Alpha Protocol</option>
                  <option value="Chip">Chip - Beta Protocol</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Mật khẩu</label>
                <input type="password" required placeholder="Nhập mật khẩu..." className="w-full p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 outline-none focus:border-cyan-500 transition-colors placeholder-slate-600" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              </div>
              {loginError && <p className="text-sm text-red-400 bg-red-950/30 p-2 rounded-lg text-center border border-red-900/50 animate-pulse">{loginError}</p>}
              <button type="submit" className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white p-3.5 rounded-xl font-bold hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/20 hover:shadow-cyan-500/40 transition-all duration-300">Truy cập Hệ thống</button>
            </form>
          </div>
        </div>
      ) : (
        <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 text-slate-200 ${theme.bg}`}>
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
            
            {/* HEADER & NOTIFICATION BELL */}
            <div className={`p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-5 ${theme.card}`}>
              <div className="flex items-center justify-between w-full md:w-auto space-x-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${theme.btn}`}>
                    {user[0]}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-white text-xl tracking-wide">PHÂN HỆ {user.toUpperCase()}</h2>
                    <p className="text-sm text-slate-400">Trạng thái: Đang hoạt động 🟢</p>
                  </div>
                </div>

                {/* NOTIFICATION BELL (MOBILE & DESKTOP) */}
                <div className="relative">
                  <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 rounded-xl bg-black/40 border border-white/10 hover:bg-white/10 transition-colors">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">{notifications.length}</span>
                      </span>
                    )}
                  </button>

                  {/* DROPDOWN NOTIFICATION */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all">
                      <div className="p-3 bg-slate-800/50 border-b border-slate-700 font-bold text-white text-sm">
                        Thông báo dinh dưỡng
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-sm">Tuyệt vời! Bạn đang theo đúng kế hoạch.</div>
                        ) : (
                          notifications.map((notif, idx) => (
                            <div key={idx} className={`p-3 border-b border-slate-800 text-sm flex gap-3 ${notif.type === 'danger' ? 'bg-red-950/20' : 'bg-yellow-950/20'}`}>
                              <span className="text-xl">{notif.type === 'danger' ? '🚨' : '⚠️'}</span>
                              <span className="text-slate-200 leading-snug">{notif.text}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center bg-black/40 p-1.5 rounded-xl gap-2 border border-white/5">
                {[ { id: "daily", label: "🍽️ Dinh dưỡng" }, { id: "workout", label: "🔥 Vận động" }, { id: "profile", label: "⚙️ Chỉ số" }, { id: "stats", label: "📊 Dữ liệu" }, { id: "backup", label: "💾 Sao lưu" }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === tab.id ? `${theme.btn}` : "text-slate-400 hover:text-white hover:bg-white/5"}`}>{tab.label}</button>
                ))}
              </div>
              <button onClick={() => setUser(null)} className="text-sm font-semibold text-slate-500 hover:text-red-400 transition-colors hidden md:block">Ngắt kết nối ⏏</button>
            </div>

            {/* TAB 1: DINH DƯỠNG */}
            <div className={`transition-all duration-500 ${activeTab === "daily" ? "block opacity-100 translate-y-0 space-y-6" : "hidden opacity-0 translate-y-4"}`}>
              <div className={`p-6 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-6 ${theme.card}`}>
                <div className="flex flex-col space-y-2 w-full xl:w-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian thực</span>
                  <input type="date" className={`p-2.5 rounded-xl text-sm outline-none transition-colors w-full xl:w-40 cursor-pointer ${theme.input}`} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
                
                <div className="flex flex-wrap justify-center items-center text-center gap-4 md:gap-8 flex-1">
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Mục tiêu (TDEE)</p>
                    <p className="text-2xl font-black text-white drop-shadow-md">{Math.round(targetCalories)}</p>
                  </div>
                  <div className="text-slate-600 text-xl font-light">-</div>
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Đã nạp</p>
                    <p className={`text-2xl font-black drop-shadow-md ${theme.text}`}>{Math.round(dailyTotals.consumedCalories)}</p>
                  </div>
                  <div className="text-slate-600 text-xl font-light">+</div>
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Đốt cháy</p>
                    <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">{Math.round(dailyTotals.burnedCalories)}</p>
                  </div>
                  <div className="text-slate-600 text-xl font-light">=</div>
                  <div className={`px-6 py-3 rounded-2xl border ${remainingCalories >= 0 ? 'bg-emerald-950/30 border-emerald-900/50 shadow-[0_0_15px_rgba(52,211,153,0.1)]' : 'bg-red-950/30 border-red-900/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Còn Lại Hôm Nay</p>
                    <p className={`text-3xl font-black tracking-tight ${remainingCalories >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{Math.round(remainingCalories)} <span className="text-sm font-medium opacity-60">kcal</span></p>
                  </div>
                </div>
              </div>

              {/* THANH TIẾN ĐỘ MACRO */}
              <div className={`p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 ${theme.card}`}>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold"><span className="text-blue-400">Protein</span><span className="text-slate-300">{Math.round(dailyTotals.consumedProtein)} / {Math.round(targetMacros.protein)}g</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full transition-all" style={{width: `${Math.min(100, (dailyTotals.consumedProtein / targetMacros.protein) * 100)}%`}}></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold"><span className="text-yellow-400">Carbs</span><span className="text-slate-300">{Math.round(dailyTotals.consumedCarbs)} / {Math.round(targetMacros.carbs)}g</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-yellow-500 h-full transition-all" style={{width: `${Math.min(100, (dailyTotals.consumedCarbs / targetMacros.carbs) * 100)}%`}}></div></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold"><span className="text-red-400">Fat</span><span className="text-slate-300">{Math.round(dailyTotals.consumedFat)} / {Math.round(targetMacros.fat)}g</span></div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-red-500 h-full transition-all" style={{width: `${Math.min(100, (dailyTotals.consumedFat / targetMacros.fat) * 100)}%`}}></div></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MEALS.map((meal) => (
                  <MealCard key={meal} mealName={meal} items={currentDayData.meals[meal]} theme={theme} onAddMultiple={(drafts) => handleAddMultiple(meal, drafts)} onDelete={(id) => handleDeleteItem(meal, id)} />
                ))}
              </div>
            </div>

            {/* TAB 2: VẬN ĐỘNG */}
            <div className={`transition-all duration-500 ${activeTab === "workout" ? "block opacity-100 space-y-6" : "hidden opacity-0"}`}>
              <WorkoutTab videos={WORKOUT_VIDEOS} theme={theme} userWeight={userProfile.weight || 60} workouts={currentDayData.workouts} onSaveWorkout={handleSaveWorkout} onDeleteWorkout={handleDeleteWorkout} />
            </div>

            {/* TAB 3: HỒ SƠ */}
            <div className={`transition-all duration-500 ${activeTab === "profile" ? "block opacity-100" : "hidden opacity-0"}`}>
              <ProfileForm profile={userProfile} theme={theme} onSave={(newProf) => { setProfiles(prev => ({...prev, [user]: newProf})); alert("Đã cập nhật dữ liệu!"); }}/>
            </div>

            {/* TAB 4: THỐNG KÊ (ĐÃ THÊM RADAR CHART) */}
            <div className={`transition-all duration-500 ${activeTab === "stats" ? "block opacity-100 space-y-6" : "hidden opacity-0"}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-2xl flex flex-col justify-center ${theme.card}`}>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Thâm hụt ({analyticsData.kpis.daysCount} ngày ghi nhận)</p>
                  <h3 className={`text-3xl font-black ${analyticsData.kpis.weeklyDeficit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                    {analyticsData.kpis.weeklyDeficit > 0 ? '+' : ''}{analyticsData.kpis.weeklyDeficit} <span className="text-sm font-normal text-slate-500">kcal</span>
                  </h3>
                </div>
                <div className={`p-6 rounded-2xl flex flex-col justify-center ${theme.card}`}>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Ước tính giảm mỡ</p>
                  <h3 className="text-3xl font-black text-white">{analyticsData.kpis.estimatedWeightLoss} <span className="text-sm font-normal text-slate-500">kg</span></h3>
                </div>
                <div className={`p-6 rounded-2xl flex flex-col justify-center ${theme.card}`}>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">TB Calo nạp/ngày</p>
                  <h3 className={`text-3xl font-black ${theme.text}`}>{analyticsData.kpis.averageIntake} <span className="text-sm font-normal text-slate-500">kcal</span></h3>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Biểu đồ Radar Macros */}
                <div className={`p-6 rounded-2xl xl:col-span-1 flex flex-col items-center justify-center ${theme.card}`}>
                  <h3 className="text-lg font-bold text-slate-200 w-full text-left mb-2">Cân Bằng Dinh Dưỡng Hôm Nay</h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar name="Thực tế nạp" dataKey="A" stroke={theme.chartColors.consumed} fill={theme.chartColors.consumed} fillOpacity={0.5} />
                        <Radar name="Mục tiêu" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f1f5f9' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Biểu đồ Bar Chart Cũ */}
                <div className={`p-6 rounded-2xl xl:col-span-2 ${theme.card}`}>
                  <h3 className="text-lg font-bold text-slate-200 mb-6">Biểu đồ Năng lượng (Chỉ tính ngày có dữ liệu)</h3>
                  {analyticsData.chartData.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-slate-500 italic">Chưa có dữ liệu để vẽ biểu đồ. Hãy bắt đầu nhập liệu!</div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analyticsData.chartData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f1f5f9' }} />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} />
                          <Bar dataKey="consumed" name="Đã Nạp" fill={theme.chartColors.consumed} radius={[4, 4, 0, 0]} maxBarSize={30} />
                          <Bar dataKey="burned" name="Đốt Cháy" fill={theme.chartColors.burned} radius={[4, 4, 0, 0]} maxBarSize={30} />
                          <Line type="monotone" dataKey="tdee" name="TDEE" stroke={theme.chartColors.tdee} strokeWidth={2} dot={{ r: 3 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TAB 5: SAO LƯU */}
            <div className={`transition-all duration-500 ${activeTab === "backup" ? "block opacity-100" : "hidden opacity-0"}`}>
              <BackupTab globalHistory={globalHistory} profiles={profiles} setGlobalHistory={setGlobalHistory} setProfiles={setProfiles} theme={theme} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTS
// ==============================================================================

function MealCard({ mealName, items, theme, onAddMultiple, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalCalories = items.reduce((s, i) => s + i.calories, 0);

  return (
    <>
      <div className={`rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl ${theme.card}`}>
        <div className={`px-5 py-4 border-b ${theme.border} flex justify-between items-center bg-black/20`}>
          <h4 className={`font-black text-lg tracking-wide ${theme.text}`}>{mealName}</h4>
          <span className="text-sm font-bold bg-black/40 px-3 py-1 rounded-full border border-white/5 shadow-inner">
            {Math.round(totalCalories)} <span className="text-[10px] text-slate-400 uppercase">kcal</span>
          </span>
        </div>
        
        <div className={`p-3 bg-black/10 border-b flex justify-center ${theme.borderSubtle}`}>
          <button onClick={() => setIsModalOpen(true)} className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${theme.btnOutline}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tìm & Thêm Thực Phẩm
          </button>
        </div>
        
        <div className="p-2 flex-1 min-h-[120px] max-h-[250px] overflow-y-auto custom-scrollbar">
          {items.length === 0 ? (
             <div className="h-full flex items-center justify-center text-slate-600 text-sm italic py-6">Chưa có dữ liệu nạp.</div>
          ) : (
            items.map(item => (
              <div key={item.id} className={`flex justify-between items-center p-3 my-1 rounded-xl group transition-colors ${theme.itemBg}`}>
                <div className="w-full mr-2">
                  <p className="text-sm font-bold text-slate-200 flex justify-between">
                    <span>{item.name} <span className="font-normal text-slate-500 text-xs">({item.grams}g)</span></span>
                    <span className={theme.text}>{Math.round(item.calories)} kcal</span>
                  </p>
                  <p className={`text-[10px] font-medium mt-1 text-slate-400 flex gap-2`}>
                    <span className="text-blue-400/80">P: {Math.round(item.protein)}g</span>
                    <span className="text-yellow-400/80">C: {Math.round(item.carbs)}g</span>
                    <span className="text-red-400/80">F: {Math.round(item.fat)}g</span>
                  </p>
                </div>
                <button onClick={() => onDelete(item.id)} className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <FoodSelectorModal 
          theme={theme} 
          mealName={mealName}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(drafts) => {
            onAddMultiple(drafts);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function FoodSelectorModal({ theme, mealName, onClose, onConfirm }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Tất cả");
  const [drafts, setDrafts] = useState({}); 

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCat === "Tất cả" || f.category === activeCat;
      return matchSearch && matchCat;
    });
  }, [search, activeCat]);

  const toggleFood = (id) => {
    setDrafts(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id]; 
      else next[id] = 100; 
      return next;
    });
  };

  const updateGrams = (id, val) => {
    if(val < 0) return;
    setDrafts(prev => ({ ...prev, [id]: Number(val) }));
  };

  const selectedCount = Object.keys(drafts).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-3xl h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border ${theme.border} bg-slate-950`}>
        
        <div className={`p-5 border-b ${theme.borderSubtle} bg-slate-900/50`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black text-white tracking-wide">Thêm vào {mealName}</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm món ăn..." 
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none transition-colors placeholder-slate-500 font-medium ${theme.input}`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className={`flex overflow-x-auto hide-scrollbar gap-2 px-5 py-3 border-b ${theme.borderSubtle} bg-slate-950`}>
          {FOOD_CATEGORIES.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCat(cat)} 
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                activeCat === cat 
                  ? `${theme.btn} border-transparent` 
                  : `border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 bg-slate-900/50`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-950/50">
          {filteredFoods.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 italic">Không tìm thấy món ăn phù hợp.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFoods.map(food => {
                const isSelected = !!drafts[food.id];
                return (
                  <div 
                    key={food.id} 
                    onClick={() => !isSelected && toggleFood(food.id)} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected ? `bg-slate-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]` : `bg-slate-900/40 border-slate-800/50 hover:border-slate-700 hover:bg-slate-900`
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div onClick={(e) => { e.stopPropagation(); toggleFood(food.id); }} className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-slate-600 bg-slate-800'}`}>
                        {isSelected && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                      
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{food.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex gap-1.5">
                           <span>{food.caloriesPer100g}kcal</span>
                           <span>• P:{food.p}</span>
                           <span>• C:{food.c}</span>
                           <span>• F:{food.f}</span>
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 ml-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <input 
                          type="number" 
                          min="1"
                          className="w-20 px-3 py-2 text-center text-sm font-bold rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-cyan-500 outline-none"
                          value={drafts[food.id]}
                          onChange={(e) => updateGrams(food.id, e.target.value)}
                        />
                        <span className="text-xs text-slate-400 font-medium">g</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`p-5 border-t ${theme.borderSubtle} bg-slate-900/80 backdrop-blur-md flex justify-between items-center`}>
          <div className="flex flex-col">
             <span className="text-sm font-medium text-slate-400">Đã chọn: <strong className="text-white text-lg">{selectedCount}</strong> món</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">Huỷ bỏ</button>
            <button 
              onClick={() => onConfirm(drafts)} 
              disabled={selectedCount === 0}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                selectedCount > 0 ? theme.btn : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              Xác nhận thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// CÁC SUB-COMPONENT BÊN DƯỚI KHÔNG THAY ĐỔI
function WorkoutTab({ videos, theme, userWeight, workouts, onSaveWorkout, onDeleteWorkout }) {
  const [selectedVid, setSelectedVid] = useState(videos[0]);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const startTimer = () => { if (!isRunning) { setIsRunning(true); timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000); } };
  const pauseTimer = () => { setIsRunning(false); clearInterval(timerRef.current); };
  const resetTimer = () => { setIsRunning(false); clearInterval(timerRef.current); setElapsed(0); };
  const formatTime = (secs) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const finishWorkout = () => {
    pauseTimer();
    const minutes = Math.max(1, Math.round(elapsed / 60)); 
    const burned = Math.round((selectedVid.met * 3.5 * userWeight) / 200 * minutes);
    onSaveWorkout({ id: Date.now(), title: selectedVid.title, minutes, calories: burned });
    resetTimer();
  };
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        <div className={`p-5 rounded-2xl ${theme.card}`}>
          <h3 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Hệ thống bài tập (MET)</h3>
          <div className="flex flex-wrap gap-2.5 mb-5">
            {videos.map(v => (
              <button key={v.id} onClick={() => setSelectedVid(v)} className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 ${selectedVid.id === v.id ? theme.btn : `bg-black/30 border border-white/5 text-slate-400 hover:text-white ${theme.textHover}`}`}>{v.title}</button>
            ))}
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <iframe className="absolute top-0 left-0 w-full h-full" src={`https://www.youtube.com/embed/${selectedVid.id}`} allowFullScreen title={selectedVid.title}></iframe>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className={`p-6 rounded-2xl text-center flex flex-col items-center justify-center ${theme.card}`}>
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
             <div className={`absolute inset-0 rounded-full border-4 ${isRunning ? `border-t-transparent ${theme.border} animate-spin` : 'border-white/5'}`}></div>
             <div className={`text-5xl font-black font-mono tracking-tighter drop-shadow-lg ${isRunning ? theme.text : 'text-slate-300'}`}>{formatTime(elapsed)}</div>
          </div>
          <div className="space-y-3 w-full">
            {!isRunning ? (
              <button onClick={startTimer} className={`w-full py-3.5 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] ${theme.btn}`}>▶ KHỞI ĐỘNG CHU CHUYỂN</button>
            ) : (
              <button onClick={pauseTimer} className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02]">⏸ TẠM DỪNG</button>
            )}
            <div className="flex gap-3">
              <button onClick={resetTimer} className="flex-1 py-3 bg-black/40 border border-white/10 text-slate-400 rounded-xl font-semibold text-sm hover:bg-black/60 transition-colors">Hủy / Reset</button>
              <button onClick={finishWorkout} disabled={elapsed < 10} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 rounded-xl font-semibold text-sm disabled:opacity-30 disabled:hover:scale-100 transition-all hover:scale-[1.03]">Ghi Nhận</button>
            </div>
          </div>
        </div>
        <div className={`p-5 rounded-2xl ${theme.card}`}>
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-3">Dữ liệu vận động hôm nay</h3>
          {workouts.length === 0 ? <p className="text-sm text-slate-600 italic text-center py-4">Hệ thống chưa ghi nhận hoạt động.</p> : (
            <ul className="space-y-3">
              {workouts.map(w => (
                <li key={w.id} className="bg-black/30 p-3.5 rounded-xl flex justify-between items-center group border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-200">{w.title}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">🔥 Năng lượng tiêu hao: {w.calories} kcal <span className="text-slate-600 px-1">|</span> {w.minutes} phút</p>
                  </div>
                  <button onClick={() => onDeleteWorkout(w.id)} className="text-red-400/50 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-400/10">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ profile, theme, onSave }) {
  const [form, setForm] = useState(profile);
  const update = (key, val) => setForm(prev => ({...prev, [key]: val}));
  return (
    <div className={`max-w-2xl mx-auto p-8 md:p-10 rounded-3xl ${theme.card}`}>
      <div className="text-center mb-10">
        <h2 className={`text-3xl font-black drop-shadow-md tracking-tight ${theme.text}`}>THÔNG SỐ SINH TRẮC</h2>
        <p className="text-sm text-slate-400 mt-2">Đồng bộ hóa dữ liệu cá nhân để tính toán thuật toán TDEE chuẩn xác.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Giới tính</label><select className={`w-full p-3.5 rounded-xl transition-colors cursor-pointer ${theme.input}`} value={form.gender} onChange={e => update("gender", e.target.value)}><option value="male">Nam (Male)</option><option value="female">Nữ (Female)</option></select></div>
          <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tuổi tác</label><input type="number" required className={`w-full p-3.5 rounded-xl transition-colors ${theme.input}`} value={form.age} onChange={e => update("age", Number(e.target.value))}/></div>
          <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chiều cao (cm)</label><input type="number" required className={`w-full p-3.5 rounded-xl transition-colors ${theme.input}`} value={form.height} onChange={e => update("height", Number(e.target.value))}/></div>
          <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cân nặng (kg)</label><input type="number" required step="0.1" className={`w-full p-3.5 rounded-xl transition-colors ${theme.input}`} value={form.weight} onChange={e => update("weight", Number(e.target.value))}/></div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Hệ số vận động (AMR)</label>
          <select className={`w-full p-3.5 rounded-xl transition-colors cursor-pointer ${theme.input}`} value={form.activity} onChange={e => update("activity", Number(e.target.value))}>
            <option value="1.2">1.2 - Thuần văn phòng, ít vận động</option>
            <option value="1.375">1.375 - Vận động nhẹ nhàng (1-3 buổi/tuần)</option>
            <option value="1.55">1.55 - Vận động trung bình (3-5 buổi/tuần)</option>
            <option value="1.725">1.725 - Vận động cường độ cao (6-7 buổi/tuần)</option>
          </select>
        </div>
        <button type="submit" className={`w-full py-4 mt-8 rounded-xl font-black text-lg tracking-wide uppercase transition-all duration-300 hover:scale-[1.02] ${theme.btn}`}>ĐỒNG BỘ DỮ LIỆU</button>
      </form>
    </div>
  );
}

function BackupTab({ globalHistory, profiles, setGlobalHistory, setProfiles, theme }) {
  const fileInputRef = useRef(null);
  const handleExport = () => {
    const backupData = { globalHistory, profiles };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `FitnessOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.globalHistory && parsed.profiles) { setGlobalHistory(parsed.globalHistory); setProfiles(parsed.profiles); alert("Phục hồi dữ liệu hệ thống thành công!"); } 
        else { alert("Lỗi: Cấu trúc file JSON không hợp lệ."); }
      } catch (error) { alert("Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng JSON."); }
    };
    reader.readAsText(file);
    e.target.value = ""; 
  };
  return (
    <div className={`max-w-2xl mx-auto p-8 md:p-10 rounded-3xl ${theme.card}`}>
      <div className="text-center mb-10">
        <h2 className={`text-3xl font-black drop-shadow-md tracking-tight ${theme.text}`}>QUẢN TRỊ DỮ LIỆU</h2>
        <p className="text-sm text-slate-400 mt-2">Sao lưu hoặc phục hồi toàn bộ dữ liệu lịch sử và hồ sơ người dùng.</p>
      </div>
      <div className="space-y-6">
        <div className="p-6 bg-black/20 rounded-2xl border border-white/5 text-center">
          <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30"><svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></div>
          <h3 className="text-lg font-bold text-white mb-2">Trích xuất Dữ liệu (Export)</h3>
          <p className="text-xs text-slate-400 mb-6 px-4">Tải xuống toàn bộ dữ liệu hiện tại dưới dạng file JSON.</p>
          <button onClick={handleExport} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all hover:scale-105">Tải File JSON</button>
        </div>
        <div className="p-6 bg-black/20 rounded-2xl border border-white/5 text-center">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30"><svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg></div>
          <h3 className="text-lg font-bold text-white mb-2">Phục hồi Dữ liệu (Import)</h3>
          <p className="text-xs text-slate-400 mb-6 px-4">Khôi phục hệ thống từ file JSON đã sao lưu. <span className="text-red-400">Lưu ý: Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại.</span></p>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all hover:scale-105">Tải Lên File JSON</button>
        </div>
      </div>
    </div>
  );
}