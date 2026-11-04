/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// corporate_sdk 1.7.0: South River's own bottles in three sizes - 500 ml,
// 1.5 litres and the 5 litre jug with its handle and curved wrap - drawn as
// SVG markup strings, so the hero's loop and the sizes section can lay them
// out on a fixed stage. The approved render's generator (Ray, 2026-11-02:
// the three-size hero render), itself #159's Bottle generalised per size:
// every coordinate is written in the 500 ml drawing's space (x 28..192,
// y 0..620) and mapped through X()/Y() into each size's geometry, so all
// three carry the same PET and live-water stack as site-art.tsx's Bottle.
// The label is the data label's own art image with the size words from data
// (data/products.json) set over it as text. Server safe: no hooks, no
// browser APIs; every id is prefixed with the instance id; every data
// string is escaped.

export type SizeMl = 500 | 1500 | 5000;

interface SizeGeom {
  hw: number;
  cs: number;
  sh: number;
  b: number;
  lab: [number, number];
  jug?: boolean;
}

export interface SizeBottleOpts {
  ml: SizeMl;
  /** The size words printed on the label (and large on the jug's wrap). */
  sizeText?: string;
  /** The label's ground colour. */
  labelBg?: string;
  /** The label art image (a public path), drawn over the ground. */
  art?: string;
  cap?: string;
  /** The jug wrap's accent (its rules and big size words). */
  accent?: string;
}

export interface SizeBottle {
  svg: string;
  /** viewBox width and height, its top (the jug's handle rises above 0) and the foot line. */
  W: number;
  H: number;
  top: number;
  footY: number;
}

export function esc(s: string | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The bottle size a product name gives: "500 ml", "1.5 L", "1,5 litres",
 * "5 L" and the like, to the nearest size drawn; undefined when there is no
 * number with a unit in it.
 */
export function sizeMlOf(name: string | undefined): SizeMl | undefined {
  const m = /(\d+(?:[.,]\d+)?)\s*(ml|millilit|l\b|lit)/i.exec(name ?? "");
  if (!m) return undefined;
  const v = parseFloat(m[1].replace(",", "."));
  const ml = /^m/i.test(m[2]) ? v : v * 1000;
  const sizes: SizeMl[] = [500, 1500, 5000];
  return sizes.reduce((a, b) => (Math.abs(Math.log(b / ml)) < Math.abs(Math.log(a / ml)) ? b : a));
}

const SIZES: Record<SizeMl, SizeGeom> = {
  500: { hw: 82, cs: 1, sh: 164, b: 496, lab: [250, 404] },
  1500: { hw: 112, cs: 1, sh: 262, b: 688, lab: [352, 548] },
  5000: { hw: 206, cs: 1.62, sh: 300, b: 742, lab: [392, 628], jug: true },
};
const BUBBLES: number[][] =[[64,40,2.2,15,0,.18],[150,30,1.6,12,3.4,.62],[100,52,1.2,17,6.8,.4],[168,60,2.6,19,1.8,.86],[84,26,1.4,13,9.2,.74],[132,44,1.9,16,11.6,.08],[56,70,1.1,14,5.2,.52]];
const CAUSTICS: number[][] =[[204,2,6.5,0],[228,1.4,8,2.2],[-122,2.2,7,1],[-100,1.5,9,3.6],[-76,2.6,6,.4],[-54,1.8,8.5,4.8],[-34,2.4,7.5,2.8]];
const RUN: number[][] =[[62,176,6,0],[164,200,5.4,2.6],[118,238,5,5.1],[150,300,5.6,1.2],[58,330,5.2,3.6],[172,392,6,.6],[96,424,5.4,4.4],[52,470,6,2],[140,500,5,5.8]];
const DROPS: number[][] =[[58,150,5],[160,140,4],[70,226,3.5],[150,232,6],[48,430,4],[172,420,3.5],[100,520,5],[140,548,3],[62,560,4.5],[120,110,3]];
function dropPath(r: number){const k=r/5,f=(v: number)=>(v*k).toFixed(2);return `M0 ${f(-8)} C${f(3)} ${f(-3)} ${f(5)} ${f(-.5)} ${f(5)} ${f(2)} A${f(5)} ${f(5)} 0 0 1 ${f(-5)} ${f(2)} C${f(-5)} ${f(-.5)} ${f(-3)} ${f(-3)} 0 ${f(-8)} Z`;}
const n=(v: number)=>+v.toFixed(2);

export function sizeBottleSvg(id: string, opts: SizeBottleOpts): SizeBottle {
  const S=SIZES[opts.ml],k=S.hw/82,cs=S.cs,vk=Math.min(k,1.25);
  const pad=S.jug?40:28, cx=S.hw+pad, W=2*cx;
  const n1=84*cs; // neck bottom
  const top=S.jug?-150:0;
  // y map: cap/neck scales with the cap, shoulder and body stretch to the size, base keeps the feet
  const Y=(y: number)=>n(y<=84?y*cs:y<=164?n1+(y-84)*(S.sh-n1)/80:y<=496?S.sh+(y-164)*(S.b-S.sh)/332:S.b+(y-496)*vk);
  const XB=(x: number)=>n(cx+(x-110)*k), XN=(x: number)=>n(cx+(x-110)*cs);
  const b=S.b, vbH=Y(620)-top;
  const L=Y(76); // water level, in the neck
  const [l0,l1]=S.lab, lc=S.jug?20:12;
  const LABEL=`M${XB(20)} ${l0} Q${cx} ${l0+lc} ${XB(200)} ${l0} V${l1} Q${cx} ${l1+lc} ${XB(20)} ${l1} Z`;
  // body outline
  let body: string;
  const nh=22*cs;
  if(!S.jug){
    body=`M${cx-nh} ${Y(48)} H${cx+nh} V${n1} C${cx+nh} ${n1+22*cs} ${XB(192)} ${S.sh-52*Math.min(k,1.6)} ${XB(192)} ${S.sh} V${b} `+
    `C${XB(192)} ${b+40*vk} ${XB(188)} ${b+68*vk} ${XB(178)} ${b+84*vk} Q${XB(170)} ${b+100*vk} ${XB(152)} ${b+99*vk} Q${XB(140)} ${b+98*vk} ${XB(132)} ${b+93*vk} Q${cx} ${b+106*vk} ${XB(88)} ${b+93*vk} `+
    `Q${XB(80)} ${b+98*vk} ${XB(68)} ${b+99*vk} Q${XB(50)} ${b+100*vk} ${XB(42)} ${b+84*vk} C${XB(32)} ${b+68*vk} ${XB(28)} ${b+40*vk} ${XB(28)} ${b} `+
    `V${S.sh} C${XB(28)} ${S.sh-52*Math.min(k,1.6)} ${cx-nh} ${n1+22*cs} ${cx-nh} ${n1} Z`;
  } else {
    // a square PET jug: short neck, broad sloped shoulders, boxy body, rounded foot
    const R=cx+S.hw, Lx=cx-S.hw, f=Y(600);
    body=`M${cx-nh} ${Y(48)} H${cx+nh} V${n1} C${cx+nh} ${n1+30} ${R-40} ${S.sh-70} ${R} ${S.sh-4} V${b} `+
    `C${R} ${b+60} ${R-6} ${f-8} ${R-40} ${f} Q${R-70} ${f+4} ${cx+40} ${f-2} Q${cx} ${f+6} ${cx-40} ${f-2} Q${Lx+70} ${f+4} ${Lx+40} ${f} C${Lx+6} ${f-8} ${Lx} ${b+60} ${Lx} ${b} `+
    `V${S.sh-4} C${Lx+40} ${S.sh-70} ${cx-nh} ${n1+30} ${cx-nh} ${n1} Z`;
  }
  const rib=(y: number)=>`M${XB(20)} ${y} Q${cx} ${y+7*Math.min(k,1.6)} ${XB(200)} ${y}`;
  const capFill=esc(opts.cap||'#ffffff');
  const knurls=Array.from({length:17},(_,i)=>cx+30*cs*Math.sin(((i-8)*10*Math.PI)/180));
  const wave=(y: number,amp: number,depth: number)=>{const WL=22;let d=`M${XB(28)-30} ${y} q${WL/4} ${-amp} ${WL/2} 0`;const c=Math.ceil((W+80)/11);for(let i=1;i<c;i++)d+=` t${WL/2} 0`;return `${d} V${y+depth} H${XB(28)-30} Z`;};
  const waveLine=(y: number,a: number)=>wave(y,a,0).replace(/ V.*$/,'');
  const g=id;
  const specY0=Y(172),specY1=Y(552),glY0=Y(150),glY1=Y(570);
  const st=(y: number,a: number,b2: number)=>((y-a)/(b2-a)).toFixed(3);
  // label art: data face (private label) or the site's own label art, sized to the bottle
  const labW=XB(200)-XB(20), labH=l1-l0;
  const art=opts.art, sizeText=esc(opts.sizeText);
  const iw=Math.min(labW*0.69,labH*1.2*0.98*180/150)*(S.jug?0.62:1), ih=iw*150/180;
  const inner=(art?`<image href="${esc(art)}" x="0" y="0" width="180" height="150" preserveAspectRatio="xMidYMid meet"/>`:'')+
    (sizeText?`<text x="172" y="146" text-anchor="end" style="font-family:var(--cs-font-sans-stack)" font-weight="800" font-size="6.4" letter-spacing=".2" fill="#ffffff">${sizeText}</text>`:'');
  const extra=S.jug?`<text x="${cx}" y="${l1-14}" text-anchor="middle" style="font-family:var(--cs-font-display-stack);font-style:var(--cs-display-style)" font-weight="900" font-size="22" fill="${esc(opts.accent||'var(--cs-highlight, #ffe500)')}" letter-spacing="1">${sizeText}</text><rect x="${XB(20)}" y="${l0+7}" width="${labW}" height="3" fill="${esc(opts.accent||'var(--cs-highlight, #ffe500)')}"/><rect x="${XB(20)}" y="${l1-4}" width="${labW}" height="3" fill="${esc(opts.accent||'var(--cs-highlight, #ffe500)')}"/>`:'';
  const face=`<path d="${LABEL}" fill="${esc(opts.labelBg||'#d9001b')}"/><svg x="${n(cx-iw/2+iw*0.02)}" y="${n(l0+(S.jug?14:labH/2-ih/2+3))}" width="${n(iw)}" height="${n(ih)}" viewBox="0 0 180 150">${inner}</svg>${extra}`;
  const bub=BUBBLES.concat(S.jug?BUBBLES.map((q: number[])=>[220-q[0],q[1]+40,q[2]*1.2,q[3]+3,q[4]+4,(q[5]+.4)%1]):k>1.2?BUBBLES.slice(0,4).map(q=>[220-q[0],q[1]+30,q[2],q[3]+2,q[4]+2,(q[5]+.5)%1]):[]).map(([x,up,r,dur,delay,at]: number[])=>{
    const xx=XB(x),y=Y(596)-up,rise=y-(L+10);
    return `<g class="cs-bubble" style="--cs-rise:${-rise}px;--cs-at:${at};animation-duration:${dur}s;animation-delay:${-delay}s"><circle cx="${xx}" cy="${y}" r="${r}" fill="url(#${g}-bubble)" stroke="#4f8195" stroke-opacity=".35" stroke-width=".4"/><circle cx="${xx-r*.35}" cy="${y-r*.35}" r="${r*.3}" fill="#fff" opacity=".95"/></g>`}).join('');
  const caus=CAUSTICS.map(([y0,sw,dur,delay]: number[],i: number)=>{const y=y0<0?Y(596)+y0*vk:Y(y0);const kk=i%2?-1:1;
    return `<path class="cs-caustic" d="M${XB(30)} ${y} C${XB(62)} ${y-7*kk} ${XB(84)} ${y+6*kk} ${XB(112)} ${y} S${XB(160)} ${y-6*kk} ${XB(190)} ${y+2*kk}" fill="none" stroke="url(#${g}-caustic)" stroke-width="${sw}" stroke-linecap="round" style="animation-duration:${dur}s;animation-delay:${-delay}s"/>`}).join('');
  const ribs=S.jug?'':[Y(118),Y(132),Y(146)].map((y: number)=>`<path d="${rib(y)}" fill="none" stroke="url(#${g}-rib)" stroke-width="1.6"/><path d="${rib(y+3)}" fill="none" stroke="#1b2a33" stroke-opacity=".1" stroke-width="1.2"/>`).join('')+
    [l0-74,l0-56,l0-38,b-48,b-28,b-8].concat(k>1.2?[l1+40,l1+58]:[]).map((y: number)=>`<path d="${rib(y)}" fill="none" stroke="url(#${g}-rib)" stroke-width="2.2"/><path d="${rib(y+4)}" fill="none" stroke="#1b2a33" stroke-opacity=".12" stroke-width="1.5"/>`).join('');
  // jug: corner edges of the square body, a moulded grip panel, shoulder steps
  const jug=S.jug?(()=>{const e1=cx-S.hw+34,e2=cx+S.hw-34;let s='';
    for(const [x,o] of [[e1,.55],[e2,.3]] as const)s+=`<path d="M${x} ${S.sh+6} V${b+40}" stroke="#fff" stroke-opacity="${o}" stroke-width="2.4" fill="none"/><path d="M${x+4} ${S.sh+6} V${b+40}" stroke="#1b2a33" stroke-opacity=".12" stroke-width="2" fill="none"/>`;
    for(const y of [S.sh+26,S.sh+48,l1+40,l1+62])s+=`<path d="${rib(y)}" fill="none" stroke="url(#${g}-rib)" stroke-width="2.6"/><path d="${rib(y+4)}" fill="none" stroke="#1b2a33" stroke-opacity=".12" stroke-width="1.8"/>`;
    for(const y of [n1+20,n1+34])s+=`<path d="M${cx-nh-14} ${y} Q${cx} ${y+5} ${cx+nh+14} ${y}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>`;
    return s;})():'';
  const handle=S.jug?(()=>{const y0=Y(56),hx=40*cs+30,ht=top+16;const d=`M${cx-nh-4} ${y0+4} C${cx-hx-40} ${y0-10} ${cx-hx-34} ${ht} ${cx} ${ht} C${cx+hx+34} ${ht} ${cx+hx+40} ${y0-10} ${cx+nh+4} ${y0+4}`;
    return `<path d="${d}" fill="none" stroke="#7a0010" stroke-width="15" stroke-linecap="round" opacity=".55" transform="translate(2 4)"/><path d="${d}" fill="none" stroke="${capFill}" stroke-width="14" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${g}-hgrad)" stroke-width="14" stroke-linecap="round"/><path d="M${cx-60} ${ht-3} C${cx-30} ${ht-6} ${cx+30} ${ht-6} ${cx+60} ${ht-3}" stroke="#fff" stroke-opacity=".55" stroke-width="2.6" fill="none" stroke-linecap="round"/><rect x="${cx-nh-8}" y="${y0-2}" width="${2*nh+16}" height="14" rx="5" fill="${capFill}"/><rect x="${cx-nh-8}" y="${y0-2}" width="${2*nh+16}" height="14" rx="5" fill="url(#${g}-cap)"/>`})():'';
  const runs=RUN.map(([x,y,r,dl]: number[])=>`<g transform="translate(${XB(x)} ${Y(y)})"><rect class="cs-run-trail" x="${-r*.3}" y="0" width="${r*.6}" height="86" rx="${r*.3}" fill="url(#${g}-trail)" stroke="#3f6b80" stroke-opacity=".18" stroke-width=".6" style="animation-delay:${dl}s"/><g class="cs-run" style="animation-delay:${dl}s"><path d="${dropPath(r)}" fill="url(#${g}-bead)" stroke="#3f6b80" stroke-opacity=".7" stroke-width="1.1"/><ellipse cx="${-r*.35}" cy="${r*.1}" rx="${r*.22}" ry="${r*.4}" fill="#fff" opacity=".95"/></g></g>`).join('');
  const drops=DROPS.map(([x,y,r]: number[],i: number)=>`<circle cx="${y<=120?XN(x):XB(x)}" cy="${Y(y)}" r="${r}" fill="url(#${g}-drop)" class="cs-drop" style="animation-delay:${i*.7}s"/>`).join('');
  const lo=`transform-origin:${cx}px ${L}px`;
  const C=(x: number)=>XN(x);
  const svg=`<svg viewBox="0 ${top} ${W} ${vbH}" aria-hidden="true">
<defs>
<linearGradient id="${g}-water" x1="0" y1="${L}" x2="0" y2="${Y(596)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f4fbfd"/><stop offset=".25" stop-color="#dbf0f7"/><stop offset=".7" stop-color="#aed9e9"/><stop offset="1" stop-color="#7dbcd3"/></linearGradient>
<linearGradient id="${g}-refract" x1="${XB(28)}" y1="0" x2="${XB(192)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0b3446" stop-opacity=".42"/><stop offset=".06" stop-color="#0b3446" stop-opacity=".14"/><stop offset=".14" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".2"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#0b3446" stop-opacity=".04"/><stop offset=".9" stop-color="#0b3446" stop-opacity=".16"/><stop offset="1" stop-color="#0b3446" stop-opacity=".46"/></linearGradient>
<linearGradient id="${g}-lens" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${g}-surf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="#e3f3f8" stop-opacity=".9"/><stop offset="1" stop-color="#d9eef5" stop-opacity="0"/></linearGradient>
<linearGradient id="${g}-caustic" x1="${XB(28)}" y1="0" x2="${XB(192)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff"/><stop offset=".65" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="${g}-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="${g}-bubble" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity=".95"/></radialGradient>
<linearGradient id="${g}-rib" x1="${XB(28)}" y1="0" x2="${XB(192)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".25" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>
<linearGradient id="${g}-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".16" stop-color="#fff" stop-opacity=".08"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".88" stop-color="#1b2a33" stop-opacity=".1"/><stop offset="1" stop-color="#1b2a33" stop-opacity=".24"/></linearGradient>
<linearGradient id="${g}-glowx" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${g}-spec" x1="0" y1="${specY0}" x2="0" y2="${specY1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".06" stop-color="#fff" stop-opacity=".95"/><stop offset="${st(l0-6,specY0,specY1)}" stop-color="#fff" stop-opacity=".9"/><stop offset="${st(l0+12,specY0,specY1)}" stop-color="#fff" stop-opacity=".28"/><stop offset="${st(l1,specY0,specY1)}" stop-color="#fff" stop-opacity=".28"/><stop offset="${st(l1+18,specY0,specY1)}" stop-color="#fff" stop-opacity=".9"/><stop offset=".92" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${g}-glow" x1="0" y1="${glY0}" x2="0" y2="${glY1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".1" stop-color="#fff"/><stop offset="${st(l0-4,glY0,glY1)}" stop-color="#fff"/><stop offset="${st(l0+12,glY0,glY1)}" stop-color="#fff" stop-opacity=".35"/><stop offset="${st(l1,glY0,glY1)}" stop-color="#fff" stop-opacity=".35"/><stop offset="${st(l1+16,glY0,glY1)}" stop-color="#fff"/><stop offset=".9" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="${g}-glowmask" maskUnits="userSpaceOnUse" x="0" y="${top}" width="${W}" height="${vbH}"><rect x="0" y="${glY0}" width="${W}" height="${glY1-glY0}" fill="url(#${g}-glow)"/></mask>
<linearGradient id="${g}-lab" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".12" stop-color="#000" stop-opacity=".06"/><stop offset=".24" stop-color="#fff" stop-opacity=".16"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
<linearGradient id="${g}-cap" x1="${C(78)}" y1="0" x2="${C(142)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".1" stop-color="#fff" stop-opacity=".1"/><stop offset=".26" stop-color="#fff" stop-opacity=".5"/><stop offset=".42" stop-color="#fff" stop-opacity=".06"/><stop offset=".78" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>
<linearGradient id="${g}-hgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
<linearGradient id="${g}-ring" x1="${C(76)}" y1="0" x2="${C(144)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7fa9ba" stop-opacity=".7"/><stop offset=".25" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#e6f2f6" stop-opacity=".7"/><stop offset="1" stop-color="#5d8799" stop-opacity=".8"/></linearGradient>
<radialGradient id="${g}-drop" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#5a8396" stop-opacity=".25"/></radialGradient>
<clipPath id="${g}-clip"><path d="${body}"/></clipPath>
<clipPath id="${g}-labclip"><path d="${LABEL}"/></clipPath>
<radialGradient id="${g}-bead" cx=".4" cy=".65" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#cfe6ee" stop-opacity=".5"/><stop offset="1" stop-color="#4d7d92" stop-opacity=".6"/></radialGradient>
<linearGradient id="${g}-trail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".8"/></linearGradient>
<filter id="${g}-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="${5*Math.min(k,1.6)}"/></filter>
</defs>
<ellipse cx="${cx+2}" cy="${Y(604)}" rx="${78*k}" ry="${9*Math.min(k,1.5)}" fill="#1a0508" opacity=".35" filter="url(#${g}-blur)"/>
<path d="${body}" fill="#eef6f9" fill-opacity=".22"/>
<g clip-path="url(#${g}-clip)">
 <g class="cs-water-level" style="${lo}"><g class="cs-slosh" style="${lo}">
  <rect x="-200" y="${L+1.5}" width="${W+400}" height="${vbH+200}" fill="url(#${g}-water)"/>
  <g class="cs-wave cs-wave-back"><path d="${wave(L+.6,1.1,5)}" fill="#cfe8f1" fill-opacity=".9"/></g>
  <g class="cs-wave"><path d="${wave(L,1.5,7)}" fill="url(#${g}-surf)"/><path d="${waveLine(L,1.5)}" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/><path d="${waveLine(L+4.5,1.2)}" fill="none" stroke="#3d7f97" stroke-opacity=".32" stroke-width=".9"/></g>
 </g></g>
 <rect x="0" y="${L+6}" width="${W}" height="${vbH}" fill="url(#${g}-refract)"/>
 <rect class="cs-lens" x="${XB(152)}" y="${Y(146)}" width="${9*Math.min(k,1.6)}" height="${Y(536)-Y(146)}" rx="4.5" fill="url(#${g}-lens)" opacity=".55"/>
 <ellipse class="cs-pool" cx="${XB(114)}" cy="${Y(562)}" rx="${58*k}" ry="${14*vk}" fill="url(#${g}-pool)"/>
 ${caus}${bub}
 <path d="M${C(86)} ${Y(66)} Q${cx} ${Y(66)+2.5} ${C(134)} ${Y(66)}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.3"/><path d="M${C(86)} ${Y(71)} Q${cx} ${Y(71)+2.5} ${C(134)} ${Y(71)}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.3"/>
 ${ribs}${jug}
 ${S.jug?'':`<path d="M${XB(132)} ${Y(589)} C${XB(134)} ${Y(576)} ${XB(140)} ${Y(562)} ${XB(146)} ${Y(554)}" fill="none" stroke="#1b2a33" stroke-opacity=".14" stroke-width="1.4"/><path d="M${XB(88)} ${Y(589)} C${XB(86)} ${Y(576)} ${XB(80)} ${Y(562)} ${XB(74)} ${Y(554)}" fill="none" stroke="#1b2a33" stroke-opacity=".14" stroke-width="1.4"/>`}
 <g clip-path="url(#${g}-labclip)">${face}</g>
 <path d="${LABEL}" fill="url(#${g}-lab)"/>
 <path d="M${XB(20)} ${l0} Q${cx} ${l0+lc} ${XB(200)} ${l0}" fill="none" stroke="#fff" stroke-opacity=".55"/>
 <path d="M${XB(20)} ${l1+1.5} Q${cx} ${l1+1.5+lc} ${XB(200)} ${l1+1.5}" fill="none" stroke="#0b2430" stroke-opacity=".22" stroke-width="2"/>
 <path d="${body}" fill="url(#${g}-sheen)"/>
 <rect x="${XB(38)}" y="${glY0}" width="${26*Math.min(k,1.7)}" height="${glY1-glY0}" rx="13" fill="url(#${g}-glowx)" mask="url(#${g}-glowmask)"/>
 <rect x="${XB(47)}" y="${specY0}" width="${4.5*Math.min(k,1.4)}" height="${specY1-specY0}" rx="2.25" fill="url(#${g}-spec)"/>
 <path d="M${C(100)} ${Y(90)} C${C(92)} ${Y(110)} ${XB(58)} ${Y(118)} ${XB(49)} ${Y(160)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="${4.5*Math.min(k,1.4)}" stroke-linecap="round"/>
 <path d="M${C(120)} ${Y(92)} C${C(126)} ${Y(104)} ${XB(150)} ${Y(112)} ${XB(160)} ${Y(124)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
 <rect x="${C(92.5)}" y="${Y(50)}" width="3" height="${Y(82)-Y(50)}" rx="1.5" fill="#fff" opacity=".7"/>
 <rect x="${XB(181)}" y="${Y(176)}" width="2.6" height="${Y(556)-Y(176)}" rx="1.3" fill="#fff" opacity=".5"/>
</g>
<path d="${body}" fill="none" stroke="#0b3446" stroke-opacity=".2" stroke-width="1.6"/>
<path d="${body}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".7"/>
<rect x="${C(79)}" y="${Y(54)}" width="${62*cs}" height="${6*cs}" rx="3" fill="url(#${g}-ring)"/>
<rect x="${C(79)}" y="${Y(58.6)}" width="${62*cs}" height="1.4" rx=".7" fill="#0b3446" opacity=".22"/>
${handle}
<rect x="${C(80)}" y="${Y(40)}" width="${60*cs}" height="${9*cs}" rx="2.5" fill="${capFill}"/>
<rect x="${C(80)}" y="${Y(40)}" width="${60*cs}" height="${9*cs}" rx="2.5" fill="url(#${g}-cap)"/>
<line x1="${C(81)}" y1="${Y(43.4)}" x2="${C(139)}" y2="${Y(43.4)}" stroke="#000" stroke-opacity=".32" stroke-width=".9" stroke-dasharray="5 2.2"/>
<rect x="${C(78)}" y="${Y(2)}" width="${64*cs}" height="${39*cs}" rx="6" fill="${capFill}"/>
<rect x="${C(78)}" y="${Y(2)}" width="${64*cs}" height="${39*cs}" rx="6" fill="url(#${g}-cap)"/>
${knurls.map((x: number)=>`<line x1="${x}" y1="${Y(9)}" x2="${x}" y2="${Y(37)}" stroke="#000" stroke-opacity=".14" stroke-width="1.1"/><line x1="${x+.9}" y1="${Y(9)}" x2="${x+.9}" y2="${Y(37)}" stroke="#fff" stroke-opacity=".16" stroke-width=".7"/>`).join('')}
<rect x="${C(80)}" y="${Y(2.6)}" width="${60*cs}" height="4" rx="2" fill="#fff" opacity=".32"/>
<rect x="${C(78)}" y="${Y(38.6)}" width="${64*cs}" height="2.4" rx="1.2" fill="#000" opacity=".18"/>
${drops}${runs}
</svg>`;
  return {svg,W,H:vbH,top,footY:Y(600)};
}
