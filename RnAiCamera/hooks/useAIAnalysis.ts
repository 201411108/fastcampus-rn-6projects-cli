import RNFS from 'react-native-fs';
import aiAnalysisService from '../services/aiAnalysisService';
import firebaseStorageService from '../services/firebaseStorageService';
import { FoodAnalysisResult } from '../types/nutrition';
import { useState } from 'react';

interface UploadResult {
  result: FoodAnalysisResult;
  downloadUrl: string;
}

const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFoodImage = async (
    imageUri: string,
  ): Promise<UploadResult | null> => {
    try {
      let filePath = imageUri;

      if (imageUri.startsWith('file://')) {
        filePath = imageUri.replace('file://', '');
      } else if (imageUri.startsWith('content://')) {
        const tempPath = `${
          RNFS.CachesDirectoryPath
        }/temp_image_${Date.now()}.jpg`;
        await RNFS.copyFile(imageUri, tempPath);
        filePath = tempPath;
      }

      setIsAnalyzing(true);
      const base64 = await RNFS.readFile(filePath, 'base64');

      const uploadResult = await firebaseStorageService.uploadImage(imageUri);
      const result = await aiAnalysisService.analyzeFoodImage(base64);

      if (!result.success) {
        setError(result.error);
        return null;
      }

      if (!uploadResult.success) {
        setError(uploadResult.error);
        return null;
      }

      return {
        result: result.result,
        downloadUrl: uploadResult.downloadUrl,
      };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    error,
    analyzeFoodImage,
  };
};

export default useAIAnalysis;
