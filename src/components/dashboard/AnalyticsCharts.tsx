"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = { label: string; value: number };
const colors = ["#0B3067", "#E51C44", "#0099FF", "#17B26A", "#F79009", "#805AD5", "#0D9488"];
const tooltipStyle = { border: "1px solid #DDE2EA", borderRadius: 8, boxShadow: "0 6px 18px rgba(16,24,40,.12)", fontSize: 12 };

export function AnalyticsBarChart({ data, color = "#0B3067", height, horizontal = true }: { data: Item[]; color?: string; height?: number; horizontal?: boolean }) {
  const chartHeight = height ?? Math.max(210, data.length * (horizontal ? 38 : 42) + 55);
  return <ResponsiveContainer width="100%" height={chartHeight}><BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 6, right: 16, left: horizontal ? 4 : -12, bottom: 4 }}><CartesianGrid stroke="#EEF1F5" strokeDasharray="3 3" vertical={!horizontal} horizontal={horizontal} />{horizontal ? <><XAxis type="number" tick={{ fontSize: 10, fill: "#98A2B3" }} axisLine={false} tickLine={false} allowDecimals={false} /><YAxis type="category" dataKey="label" width={116} tick={{ fontSize: 11, fill: "#344054", fontWeight: 600 }} axisLine={false} tickLine={false} /></> : <><XAxis dataKey="label" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#98A2B3" }} axisLine={false} tickLine={false} allowDecimals={false} /></>}<Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F5F7FA" }} /><Bar dataKey="value" name="Count" fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer>;
}

export function AnalyticsDonut({ data, height = 250 }: { data: Item[]; height?: number }) {
  return <ResponsiveContainer width="100%" height={height}><PieChart><Pie data={data} dataKey="value" nameKey="label" cx="38%" cy="50%" innerRadius={height * 0.22} outerRadius={height * 0.36} paddingAngle={2}>{data.map((item, index) => <Cell key={item.label} fill={colors[index % colors.length]} stroke="#fff" strokeWidth={2} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600, color: "#344054", lineHeight: "20px" }} /></PieChart></ResponsiveContainer>;
}

export function AnalyticsTrend({ data, lines }: { data: Record<string, string | number>[]; lines?: { key: string; name: string; color: string }[] }) {
  const chartLines = lines ?? [{ key: "citizens", name: "Citizens registered", color: "#0B3067" }];
  return <ResponsiveContainer width="100%" height={220}><LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}><CartesianGrid stroke="#EEF1F5" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#98A2B3" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 600, color: "#344054" }} />{chartLines.map((line) => <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2.5} dot={{ r: 3, fill: line.color }} activeDot={{ r: 5 }} />)}</LineChart></ResponsiveContainer>;
}

export function AnalyticsAreaChart({ data, dataKey, color = "#805AD5", name = "Value" }: { data: Record<string, string | number>[]; dataKey: string; color?: string; name?: string }) {
  return <ResponsiveContainer width="100%" height={220}><AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}><defs><linearGradient id={`analytics-area-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.32} /><stop offset="100%" stopColor={color} stopOpacity={0.04} /></linearGradient></defs><CartesianGrid stroke="#EEF1F5" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#98A2B3" }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5} fill={`url(#analytics-area-${dataKey})`} /></AreaChart></ResponsiveContainer>;
}
