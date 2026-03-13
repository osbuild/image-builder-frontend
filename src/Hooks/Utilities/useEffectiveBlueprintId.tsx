import { useEffect, useRef } from 'react';

import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { validate as uuidValidate } from 'uuid';

import {
  selectSelectedBlueprintId,
  setBlueprintId,
} from '@/store/BlueprintSlice';
import { useAppSelector } from '@/store/hooks';

export const useEffectiveBlueprintId = (): string | undefined => {
  const dispatch = useDispatch();
  const selectedBlueprintId = useAppSelector(selectSelectedBlueprintId);

  const [searchParams] = useSearchParams();
  const blueprintIdParam = searchParams.get('blueprint_id')?.trim();
  const validBlueprintIdParam =
    blueprintIdParam && uuidValidate(blueprintIdParam)
      ? blueprintIdParam
      : undefined;

  const effectiveBlueprintId = selectedBlueprintId ?? validBlueprintIdParam;

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && validBlueprintIdParam) {
      dispatch(setBlueprintId(validBlueprintIdParam));
    }
    initializedRef.current = true;
  }, [validBlueprintIdParam, dispatch]);

  // Use window.history.replaceState instead of react-router's setSearchParams
  // to avoid triggering navigation events in the console.redhat.com chrome
  // shell, which cause infinite re-renders in the federated module environment.
  useEffect(() => {
    const url = new URL(window.location.href);
    const currentParam = url.searchParams.get('blueprint_id');
    if (selectedBlueprintId) {
      if (currentParam !== selectedBlueprintId) {
        url.searchParams.set('blueprint_id', selectedBlueprintId);
        window.history.replaceState(window.history.state, '', url);
      }
    } else if (currentParam) {
      url.searchParams.delete('blueprint_id');
      window.history.replaceState(window.history.state, '', url);
    }
  }, [selectedBlueprintId]);

  return effectiveBlueprintId;
};
