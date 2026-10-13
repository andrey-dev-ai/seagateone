# Ресурсы Gate One LTD

Владелец предоставил растровую композицию с логотипом G1 и вариантами применения. Использован встроенный image_gen: две обработки референса с прозрачным фоном. Это растровая подготовка, не официальный векторный исходник и не гарантия пиксельного совпадения с ним.

## Файлы

- public/gate-one/assets/gateone-mark.png — прозрачный мастер монограммы.
- public/gate-one/assets/gateone-mark.webp — WebP 256×256 для интерфейса.
- public/gate-one/assets/gateone-app-icon-master.png — мастер квадратного значка.
- public/gate-one/assets/gateone-app-icon-512.png — PNG 512×512.
- public/icon-light-32x32.png и icon-dark-32x32.png — favicon PNG 32×32.
- public/apple-icon.png — PNG 180×180.
- public/icon.svg — самостоятельная SVG-оболочка с встроенным PNG 64×64. Это НЕ векторизация.

Мастер-файлы копируются в проект; исходные результаты генерации остаются сохранёнными, не удаляются. Экспорт размеров выполнен через sharp из зависимости Next.js; форма мастер-файлов при экспорте не переизобреталась.

## Запрос для монограммы

Use case: background-extraction. Edit target: attached Gate One LTD brand sheet. Extract ONLY the large main G1 monogram from the top center, faithfully preserving its exact silhouette, proportions, counterspace, diagonal slit and the angular vertical 1 shape. Do not redesign the brand. Deliver a single square high-resolution transparent PNG with this navy G1 monogram centered and nearly filling the square with 8% breathing room. Color uniform deep navy #0c2b47, crisp smooth flat edges, no texture, no shadows, no gradients. Remove the white background entirely (true alpha). Remove ALL lettering, the GATE ONE LTD line, small logos at bottom and any square badge: only ONE faithful monogram. It will be the source asset for website brand mark and favicon, so avoid decorative embellishment.

## Запрос для значка

Use case: background-extraction. Edit target attached Gate One brand sheet. Extract ONLY the bottom-right app icon: the navy rounded-square badge containing the WHITE G1 monogram. Faithfully preserve the exact G1 silhouette, diagonal gap, proportions, vertical 1 and navy rounded-square badge from the reference. Do NOT redesign or introduce shadows, textures, gradients, lettering, other logos or a border. Deliver a single square PNG asset: navy badge fills almost the entire image with only a 2% transparent outer padding. True alpha transparent outside the rounded corners of the navy badge. Within the navy badge the white G1 is opaque white. Suitable as 32px favicon and 180px Apple touch icon. Exact original existing brand, no creative variations.

Название GATE ONE LTD в интерфейсе набрано текстом для чёткости на всех размерах; точное фирменное начертание из растрового референса не восстановлено. Для фирменного lockup и печати рекомендуется предоставить исходник SVG/AI/PDF.
