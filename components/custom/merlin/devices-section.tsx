"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import t from "@/app/lib/i18n";
 
export function DevicesSection({ id }: { id?: string }) {
  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto overflow-hidden">
      <div className="flex w-full max-w-7xl flex-col items-center gap-12 px-4 xl:px-0 mx-auto md:flex-row md:justify-between">
        <div className="relative w-full md:w-1/2 aspect-[4/3] max-w-xl">
            <Image
               unoptimized
               referrerPolicy="no-referrer"
               src="https://cdn.getmerlin.in/cms/image_ce68ee704e.webp"
               alt="floating macbook"
               fill
               className="object-contain"
            />
        </div>

        <div className="flex w-full md:w-1/2 flex-col gap-8 md:pl-12">
            <div className="flex flex-col gap-4">
               <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
                 {t('common.devices_title')}
               </h2>
               <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400">
                 {t('common.devices_desc')}
               </p>
            </div>

            <div className="flex flex-col gap-4">
                <Link href="/chat" className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
                   <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900 dark:text-white"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                   </div>
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">{t('common.web_app')}</span>
                </Link>

                <Link href="https://chromewebstore.google.com/detail/merlin-1-click-access-to/camppjleccjaphfdbohjdohecfnoikec" target="_blank" className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
                   <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                       <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/chrome_store_e2f9f97722.svg" alt={t('common.chrome_extension')} width={24} height={24} />
                    </div>
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">{t('common.chrome_extension')}</span>
                </Link>

                <Link href="https://apps.apple.com/us/app/merlin-ai-ask-anything/id6453692447" target="_blank" className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
                   <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <svg viewBox="0 0 384 512" fill="currentColor" className="w-6 h-6 text-zinc-900 dark:text-white">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-73.3-114.8-1.7-152zM219 114.4c15.7-20 26.2-47.6 23.3-75.1-23.3 1-51.2 15.5-67.9 35.1-14.9 17.5-27.1 46-24.2 72.3 25.4 2 51.1-12.3 68.8-32.3z" />
                      </svg>
                   </div>
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">{t('common.ios_app')}</span>
                </Link>

                <Link href="https://play.google.com/store/apps/details?id=com.foyer.merlin" target="_blank" className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
                   <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                       <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/playstore_88d0ae5df1.svg" alt={t('common.android_app')} width={24} height={24} />
                    </div>
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">{t('common.android_app')}</span>
                </Link>
            </div>

             <Link href="/chat" className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-[#4F46E5] px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 mt-4">
               {t('common.devices_cta')}
             </Link>
        </div>
      </div>
    </section>
  );
}
