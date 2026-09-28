export const MAX_PROMPT_LENGTH = 2000;
export const SAMPLE_PROMPT = 'A simple flat illustration of one orange cat sitting, solid light blue background, minimal shapes, no text, no letters, no watermark';
export const SAMPLE_IMAGE = '{{APP_ASSET:orange-cat.jpg}}';
export const PROMPT_IDEAS = [
  { label: '角色插畫', en: 'Character', prompt: '一隻橘貓坐在淺藍色背景前，簡單的平面插畫，乾淨線條，沒有文字。', english: SAMPLE_PROMPT },
  { label: '自然風景', en: 'Landscape', prompt: '清晨薄霧中的山間小屋，柔和陽光穿過樹林，寧靜的水彩風景，沒有文字。', english: 'A small cabin in misty mountains at dawn, soft sunlight through trees, a peaceful watercolor landscape, no text.' },
  { label: '產品情境', en: 'Product', prompt: '一只奶油色陶瓷杯放在木桌上，窗邊自然光，溫暖簡潔的產品照片，沒有文字。', english: 'A cream ceramic mug on a wooden table, natural window light, warm minimal product photography, no text.' },
];

export function promptLength(value) {
  return Array.from(value).length;
}
