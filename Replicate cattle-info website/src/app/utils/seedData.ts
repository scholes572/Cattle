import { projectId, publicAnonKey } from "/utils/supabase/info";

export async function checkAndSeedData() {
  try {
    // Check if there's any data
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2c48a4f4/cattle`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    );

    const data = await response.json();
    
    // If there's already data, don't seed
    if (data.success && data.cattle && data.cattle.length > 0) {
      return;
    }

    // Seed sample cattle data
    const sampleCattle = [
      {
        tagNumber: "A001",
        name: "Bessie",
        breed: "Holstein",
        gender: "female",
        dateOfBirth: "2022-03-15",
        weight: 550,
        color: "Black and White",
        status: "active",
        notes: "Excellent milk producer, calm temperament",
      },
      {
        tagNumber: "A002",
        name: "Thunder",
        breed: "Angus",
        gender: "male",
        dateOfBirth: "2021-05-20",
        weight: 850,
        color: "Black",
        status: "active",
        sire: "Champion Bull 123",
        notes: "Strong breeding bull with excellent genetics",
      },
      {
        tagNumber: "A003",
        name: "Daisy",
        breed: "Jersey",
        gender: "female",
        dateOfBirth: "2023-01-10",
        weight: 420,
        color: "Light Brown",
        status: "active",
        dam: "Jersey Queen 456",
        notes: "High butterfat milk content",
      },
    ];

    // Add each sample cattle
    for (const cattle of sampleCattle) {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c48a4f4/cattle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(cattle),
        }
      );
    }

    console.log("Sample data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}
