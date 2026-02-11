"use client";

import React from "react";

export default function AnimatedBackground() {
    return (
        <>
            <style jsx global>{`
        .box-area {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }
        .box-area li {
          position: absolute;
          display: block;
          list-style: none;
          width: 25px;
          height: 25px;
          background: rgba(212, 175, 55, 0.2);
          animation: animate 20s linear infinite;
          bottom: -150px;
          border-radius: 4px;
        }
        .box-area li:nth-child(1) {
          left: 86%;
          width: 80px;
          height: 80px;
          animation-delay: 0s;
        }
        .box-area li:nth-child(2) {
          left: 12%;
          width: 30px;
          height: 30px;
          animation-delay: 1.5s;
          animation-duration: 10s;
        }
        .box-area li:nth-child(3) {
          left: 70%;
          width: 100px;
          height: 100px;
          animation-delay: 5.5s;
        }
        .box-area li:nth-child(4) {
          left: 42%;
          width: 150px;
          height: 150px;
          animation-delay: 0s;
          animation-duration: 15s;
        }
        .box-area li:nth-child(5) {
          left: 65%;
          width: 40px;
          height: 40px;
          animation-delay: 0s;
        }
        .box-area li:nth-child(6) {
          left: 15%;
          width: 110px;
          height: 110px;
          animation-delay: 3.5s;
        }
        @keyframes animate {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-800px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
            <div className="box-area">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </div>
        </>
    );
}
