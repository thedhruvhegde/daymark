"use client";

import { useEffect } from "react";

export function MobileRedirect() {
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) window.location.replace("/phone");
  }, []);
  return null;
}
