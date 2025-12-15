/**
 * EcoQuest Camera Module
 * Camera initialization and recording functions
 */

const CameraModule = {
  stream: null,
  mediaRecorder: null,
  recordedChunks: [],
  isRecording: false,
  recordingStartTime: null,
  recordingTimer: null,
  facingMode: 'user',

  // Initialize camera
  async initCamera(videoElement, facingMode = 'user') {
    try {
      // Stop existing stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      this.facingMode = facingMode;

      return true;
    } catch (error) {
      console.error('Camera error:', error);
      return false;
    }
  },

  // Switch camera (front/back)
  async switchCamera(videoElement) {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    return await this.initCamera(videoElement, this.facingMode);
  },

  // Start recording
  startRecording(onDataAvailable) {
    if (!this.stream) return false;

    this.recordedChunks = [];

    const options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/mp4';
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      if (onDataAvailable) {
        this.mediaRecorder.onstop = onDataAvailable;
      }

      this.mediaRecorder.start(1000);
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      return true;
    } catch (error) {
      console.error('Recording error:', error);
      return false;
    }
  },

  // Stop recording
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      return true;
    }
    return false;
  },

  // Get recording duration
  getRecordingDuration() {
    if (!this.recordingStartTime) return 0;
    return Math.floor((Date.now() - this.recordingStartTime) / 1000);
  },

  // Get recorded blob
  getRecordedBlob() {
    if (this.recordedChunks.length === 0) return null;
    return new Blob(this.recordedChunks, { type: 'video/webm' });
  },

  // Format time for display
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // Stop all
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isRecording = false;
    this.recordedChunks = [];
  }
};

// Export
window.EcoQuestCamera = CameraModule;
