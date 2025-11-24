'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en' | 'ja';
export type Theme = 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  de: {
    title: 'Spin Art',
    intro_title: 'Willkommen bei Spin Art!',
    intro_l1: 'Wählen Sie einen Stift und drücken Sie',
    intro_l2: 'Pfeil nach links oder nach rechts.',
    intro_l3: 'Auf höchster Geschwindigkeit entstehen',
    intro_l4: 'aus Ihren Zeichnungen mit etwas Übung',
    intro_l5: 'unverwechselbare Animationen!',
    click_to_start: '(Klicke zum Starten)',
    instructions: 'Pfeiltasten steuern die Rotation (Tippen: Stufe ändern, Halten: Max-Speed)',
    shift_instruction: 'Shift',
    shift_text: 'Halte Shift und klicke zwei Punkte, um sie mit einer Linie zu verbinden.',
    space_instruction: 'Leertaste',
    space_text: 'Drücke Leertaste um zu Stoppen & Zurückzusetzen.',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    shapes: 'Formen',
    color: 'Farbe',
    size: 'Größe',
    rotation: 'Rotation',
    fill: 'Füllung',
    circle: 'Kreis',
    square: 'Quadrat',
    triangle: 'Dreieck',
    star: 'Stern',
    stop: 'Stop',
    level: 'Stufe',
    pens: 'Stifte',
    tip: 'Spitze',
    blur: 'Blur',
    eraser: 'Radierer',
    clear_paper: 'Papier leeren',
    export_video: 'Export als Video',
    export_running: 'Export läuft...',
    export_locked: 'Export gesperrt',
    wait: 'Warte',
    draw_more: 'Zeichne noch',
    mobile_warning_title: 'Nicht für Mobilgeräte optimiert',
    mobile_warning_text: 'Diese App ist für die Nutzung auf Desktop-Computern mit Tastatur und Maus ausgelegt. Die Steuerung und das Layout funktionieren auf Touchscreens möglicherweise nicht wie erwartet.',
    continue_anyway: 'Trotzdem fortfahren',
    footer_imprint: 'Impressum',
    footer_privacy: 'Datenschutz',
    theme_light: 'Hell',
    theme_dark: 'Dunkel',
    inspired_by: 'Inspiriert von LimbaTrip'
  },
  en: {
    title: 'Spin Art',
    intro_title: 'Welcome to Spin Art!',
    intro_l1: 'Select a pen and press',
    intro_l2: 'arrow left or right.',
    intro_l3: 'At max speed, your drawings',
    intro_l4: 'will turn into unique animations',
    intro_l5: 'with a little practice!',
    click_to_start: '(Click to start)',
    instructions: 'Arrow keys control rotation (Tap: change speed, Hold: Max-Speed)',
    shift_instruction: 'Shift',
    shift_text: 'Hold Shift and click two points to connect them with a line.',
    space_instruction: 'Space',
    space_text: 'Press Space to Stop & Reset.',
    undo: 'Undo',
    redo: 'Redo',
    shapes: 'Shapes',
    color: 'Color',
    size: 'Size',
    rotation: 'Rotation',
    fill: 'Fill',
    circle: 'Circle',
    square: 'Square',
    triangle: 'Triangle',
    star: 'Star',
    stop: 'Stop',
    level: 'Level',
    pens: 'Pens',
    tip: 'Tip',
    blur: 'Blur',
    eraser: 'Eraser',
    clear_paper: 'Clear Paper',
    export_video: 'Export as Video',
    export_running: 'Exporting...',
    export_locked: 'Export Locked',
    wait: 'Wait',
    draw_more: 'Draw more',
    mobile_warning_title: 'Not optimized for mobile',
    mobile_warning_text: 'This app is designed for desktop use with keyboard and mouse. Controls and layout might not work as expected on touchscreens.',
    continue_anyway: 'Continue anyway',
    footer_imprint: 'Imprint',
    footer_privacy: 'Privacy',
    theme_light: 'Light',
    theme_dark: 'Dark',
    inspired_by: 'Inspired by LimbaTrip'
  },
  ja: {
    title: 'スピンアート',
    intro_title: 'スピンアートへようこそ！',
    intro_l1: 'ペンを選んで押してください',
    intro_l2: '左または右の矢印キー。',
    intro_l3: '最高速度で、あなたの絵は',
    intro_l4: '少しの練習でユニークな',
    intro_l5: 'アニメーションに変わります！',
    click_to_start: '（クリックして開始）',
    instructions: '矢印キーで回転を制御（タップ：速度変更、長押し：最大速度）',
    shift_instruction: 'Shift',
    shift_text: 'Shiftキーを押しながら2点をクリックして線で結びます。',
    space_instruction: 'スペース',
    space_text: 'スペースキーで停止＆リセット。',
    undo: '元に戻す',
    redo: 'やり直し',
    shapes: '形',
    color: '色',
    size: 'サイズ',
    rotation: '回転',
    fill: '塗りつぶし',
    circle: '円',
    square: '正方形',
    triangle: '三角形',
    star: '星',
    stop: '停止',
    level: 'レベル',
    pens: 'ペン',
    tip: '先端',
    blur: 'ぼかし',
    eraser: '消しゴム',
    clear_paper: '紙をクリア',
    export_video: 'ビデオとしてエクスポート',
    export_running: 'エクスポート中...',
    export_locked: 'エクスポート ロック中',
    wait: '待機',
    draw_more: 'もっと描く',
    mobile_warning_title: 'モバイル向けに最適化されていません',
    mobile_warning_text: 'このアプリはキーボードとマウスを使用するデスクトップ向けに設計されています。タッチスクリーンでは操作やレイアウトが期待通りに機能しない場合があります。',
    continue_anyway: 'とにかく続ける',
    footer_imprint: '法的表示',
    footer_privacy: 'プライバシー',
    theme_light: 'ライト',
    theme_dark: 'ダーク',
    inspired_by: 'Inspired by LimbaTripに触発されました'
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('de');
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preferences here if needed
    const savedLang = localStorage.getItem('spinart-lang') as Language;
    const savedTheme = localStorage.getItem('spinart-theme') as Theme;
    if (savedLang) setLanguage(savedLang);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('spinart-lang', language);
      localStorage.setItem('spinart-theme', theme);
      
      // Tailwind uses 'dark' class for dark mode. 
      // We add 'dark' class if theme is 'dark'.
      // We remove 'dark' class if theme is 'light'.
      // We don't necessarily need a 'light' class for Tailwind unless configured, but we keep it for globals.css logic.
      
      const root = document.documentElement;
      
      if (theme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
      } else {
          root.classList.remove('dark');
          root.classList.add('light');
      }
    }
  }, [language, theme, mounted]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
