"use client";
import "./globals.css";
import NavigationBar from "@/components/NavigationBar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";




export default function RootLayout({ children }) {
  


  return (
    <html lang="en">
      <body
      >
        <Providers>


          <LayoutWrapper>
            {children}
          </LayoutWrapper>


        </Providers>

       
      </body>

    </html>
  );
}
