"use client";

import { Fragment, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Image from "next/image";
import React from 'react';

// Define the type for leaderboard data
type LeaderboardUser = {
  id: string;
  name: string | null;
  image: string | null;
  totalScore: number;
};

export default function LeaderBoard() {
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const delays = [300, 600, 900]; 
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setVisibleIndex((prev) => i);
      }, delay);
    });
    
    // Fetch leaderboard data
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      // Take only top 3 users for the leaderboard
      setLeaderboardData(data.leaderboard?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLeaderboardData([]);
    }
  };

  // Convert leaderboard data to the format expected by the UI
  const getItemsFromLeaderboardData = () => {
    return leaderboardData.map((user, index) => {
      // Medal images based on ranking
      let imagepath = '';
      switch (index) {
        case 0: imagepath = 'gold-medal.png'; break;
        case 1: imagepath = 'silver-medal.png'; break;
        case 2: imagepath = 'bronze-medal.png'; break;
      }

      // Background colors based on ranking
      let bg = '#e7e9fb';
      switch (index) {
        case 0: bg = '#1d243c'; break;
        case 1: bg = '#5a5f7a'; break;
        case 2: bg = '#898da5'; break;
      }

      // Z-index and offsets for visual stacking
      let z = 'z-0';
      let offset = '';
      switch (index) {
        case 0: z = 'z-30'; break;
        case 1: z = 'z-20'; offset = '-mt-4'; break;
        case 2: z = 'z-10'; offset = '-mt-5'; break;
      }

      return {
        id: user.id,
        label: user.name || 'Anonymous',
        score: user.totalScore,
        image: user.image,
        bg,
        z,
        offset,
        imagepath
      };
    });
  };

  const items = getItemsFromLeaderboardData();

  return (
    <Card className="flex z-10 flex-col min-w-2xs min-h-[380px] h-full bg-white/60 rounded-4xl select-none">
      <React.Fragment>
        <CardHeader className="items-center pb-0">
          <CardTitle>Leader Boards</CardTitle>
        </CardHeader>
        <CardContent className="items-center flex justify-center flex-col px-8">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`relative ${item.z} p-6 flex items-end flex-row rounded-4xl text-white text-xl transition-all duration-500 ease-out transform
                  ${item.offset}
                  ${visibleIndex >= index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{ backgroundColor: item.bg }}
              >
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={`${item.label} avatar`} 
                    width={40} 
                    height={40} 
                    className="rounded-full mr-3"
                    onError={(e) => {
                      // Handle image loading errors by hiding the image
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 mr-3" />
                )}
                <span className="p-2">{item.label}</span>
                <span className="p-2 font-bold">{item.score}</span>
                <Image src={`/${item.imagepath}`} className='self-end' width={50} height={50} alt={`${index + 1} place medal`}></Image>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              No leaderboard data available yet. Complete some interviews to see rankings!
            </div>
          )}
        </CardContent>
      </React.Fragment>
    </Card>
  );
}