# AI Detection Testing Instructions

## Testing the EcoVenture AI Image Detection

The EcoVenture application has now been launched. Follow these steps to manually test the AI detection:

### Test Procedure:

1. **The app should now be running** - You should see the EcoVenture window open

2. **Tap/Click "Tap to start camera"** - This will activate your camera

3. **Test with Real Objects:**
   - Hold up a **plastic bottle** to your camera
   - Hold up a **cup** or **can**
   - Try showing **paper** or **cardboard**
   - Try showing multiple items at once

4. **Click the Record button (red circle)** to start recording

5. **Move the trash item around** in frame for a few seconds (3-30 seconds)

6. **Click Stop** to finish recording

7. **Watch the AI analyze your video:**
   - The processing section will show progress
   - The AI will detect what type of trash you're holding
   - It will classify the material (plastic, metal, paper, etc.)
   - You'll see your points earned

### What the AI Should Detect:

The AI uses two models:

1. **COCO-SSD** - Detects the object type:
   - Bottles (water bottles, drink bottles)
   - Cups (plastic cups, coffee cups)
   - Bowls
   - Food items
   - Sports equipment
   - And 30+ other trash item types

2. **TrashNet (MobileNet)** - Classifies the material:
   - Cardboard
   - Glass
   - Metal
   - Paper
   - Plastic
   - General Trash

### Expected Behavior:

- **Plastic Bottle** should be detected as:
  - Object: "bottle" (from COCO-SSD)
  - Material: "plastic" (from TrashNet)
  - Points: 50 base + bonuses

- **Metal Can** should be detected as:
  - Object: "cup" or "can" (from COCO-SSD)
  - Material: "metal" (from TrashNet)

- **Cardboard Box** should be detected as:
  - Material: "cardboard" (from TrashNet)

### Confidence Boosting:

The AI has a smart confidence tracking system:
- If it sees the same item multiple times across frames, it boosts the confidence
- After 2+ detections of the same item (BOOST_THRESHOLD), confidence increases by 1.8x
- This prevents false positives and ensures accurate detection

### Points System:

- **Base points:** 50
- **With bin visible:** +25 points
- **Multiple items:** Up to +60 points
- **Welcome bonus** (first submission): +100 points

### Testing on Public Background:

To test "trash on public place background" as requested:

1. **Option A:** Take a photo on your phone of trash on a street/sidewalk
2. Display the photo on your phone or another screen
3. Show it to the camera in the EcoVenture app
4. The AI should detect the trash in the image

**Option B:** Print out or display a test image showing a plastic bottle on pavement/street

### Troubleshooting:

If the AI doesn't detect:
- Ensure good lighting
- Hold the item steady for 1-2 seconds
- Make sure the item is clearly visible
- Try different angles
- Check that camera permissions are granted

### What to Look For:

✅ **GOOD**: AI correctly identifies "bottle" with "plastic" material
✅ **GOOD**: Confidence increases when you hold the item steady
✅ **GOOD**: Points calculated correctly
✅ **GOOD**: Multiple items detected = bonus points

❌ **BAD**: AI doesn't detect anything
❌ **BAD**: Wrong classification (calls a plastic bottle "glass")
❌ **BAD**: Too many false positives
❌ **BAD**: App crashes or freezes

---

## Test Results

After testing, document what you found:

- **Did it correctly identify a plastic bottle?**
- **Did it correctly identify the material (plastic)?**
- **Were the points calculated correctly?**
- **Did confidence tracking work?**
- **Any false positives or negatives?**

