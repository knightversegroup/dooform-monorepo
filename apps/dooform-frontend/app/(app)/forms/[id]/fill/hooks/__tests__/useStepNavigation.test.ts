// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepNavigation } from '../useStepNavigation';

describe('useStepNavigation', () => {
  describe('without PDF editor (free tier)', () => {
    it('should start at the fill step', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      expect(result.current.currentStep).toBe('fill');
      expect(result.current.currentStepIndex).toBe(0);
    });

    it('should have three steps defined', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      expect(result.current.steps).toHaveLength(3);
      expect(result.current.steps.map((s) => s.id)).toEqual(['fill', 'review', 'download']);
      expect(result.current.totalSteps).toBe(3);
    });

    it('should indicate it is the first step', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);
    });

    it('should navigate to review step', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      act(() => { result.current.goToReview(); });

      expect(result.current.currentStep).toBe('review');
      expect(result.current.currentStepIndex).toBe(1);
    });

    it('should navigate to download step', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      act(() => { result.current.goToDownload(); });

      expect(result.current.currentStep).toBe('download');
      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.isLastStep).toBe(true);
    });

    it('should navigate using goToNext', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      act(() => { result.current.goToNext(); });
      expect(result.current.currentStep).toBe('review');

      act(() => { result.current.goToNext(); });
      expect(result.current.currentStep).toBe('download');
    });

    it('should navigate using goToPrevious', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      act(() => { result.current.goToDownload(); });
      act(() => { result.current.goToPrevious(); });
      expect(result.current.currentStep).toBe('review');

      act(() => { result.current.goToPrevious(); });
      expect(result.current.currentStep).toBe('fill');
    });

    it('should skip editor step when goToEditor is called', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      act(() => { result.current.goToEditor(); });

      // Without PDF editor, goToEditor goes to download
      expect(result.current.currentStep).toBe('download');
    });

    it('should have Thai labels', () => {
      const { result } = renderHook(() => useStepNavigation('fill', false));

      expect(result.current.steps[0].title).toBe('กรอกข้อมูล');
      expect(result.current.steps[1].title).toBe('ตรวจสอบข้อมูล');
      expect(result.current.steps[2].title).toBe('ดาวน์โหลดไฟล์');
    });

    it('should allow custom initial step', () => {
      const { result } = renderHook(() => useStepNavigation('download', false));

      expect(result.current.currentStep).toBe('download');
      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.isLastStep).toBe(true);
    });
  });

  describe('with PDF editor (pro/max tier)', () => {
    it('should have four steps defined', () => {
      const { result } = renderHook(() => useStepNavigation('fill', true));

      expect(result.current.steps).toHaveLength(4);
      expect(result.current.steps.map((s) => s.id)).toEqual(['fill', 'review', 'editor', 'download']);
      expect(result.current.totalSteps).toBe(4);
    });

    it('should navigate to editor step', () => {
      const { result } = renderHook(() => useStepNavigation('fill', true));

      act(() => { result.current.goToEditor(); });

      expect(result.current.currentStep).toBe('editor');
      expect(result.current.currentStepIndex).toBe(2);
    });

    it('should navigate from editor to download', () => {
      const { result } = renderHook(() => useStepNavigation('fill', true));

      act(() => { result.current.goToEditor(); });
      act(() => { result.current.goToNext(); });

      expect(result.current.currentStep).toBe('download');
      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.isLastStep).toBe(true);
    });

    it('should navigate back from editor to review', () => {
      const { result } = renderHook(() => useStepNavigation('fill', true));

      act(() => { result.current.goToEditor(); });
      act(() => { result.current.goToPrevious(); });

      expect(result.current.currentStep).toBe('review');
    });

    it('should have editor step with Thai label', () => {
      const { result } = renderHook(() => useStepNavigation('fill', true));

      expect(result.current.steps[2].title).toBe('แก้ไข PDF');
    });

    it('download should be at index 3', () => {
      const { result } = renderHook(() => useStepNavigation('download', true));

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.isLastStep).toBe(true);
    });

    it('should report hasPdfEditor true', () => {
      const { result } = renderHook(() => useStepNavigation('fill', true));
      expect(result.current.hasPdfEditor).toBe(true);
    });
  });
});
