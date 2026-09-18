import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registered once here instead of in every animated component
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase, DrawSVGPlugin);

// Same curve as --ease-museum in globals.css, so CSS hovers and GSAP timelines share one rhythm
CustomEase.create("museum", "0.65, 0, 0.35, 1");
// Front-loaded variant for short reveals: a symmetric in-out on a brief duration reads as a hesitant start then a snap
CustomEase.create("reveal", "0.5, 0, 0.1, 1");

export { gsap, ScrollTrigger, SplitText, useGSAP };
