import { useEffect, useState } from 'react';

import {
  useGetBlueprintsQuery,
  useLazyGetBlueprintQuery,
} from '@/store/api/backend';

const useHasMultiTargetBlueprints = () => {
  const { data: blueprintsData, isLoading: isListLoading } =
    useGetBlueprintsQuery({ limit: 100, offset: 0 });
  const [triggerGetBlueprint] = useLazyGetBlueprintQuery();

  const [hasMultiTarget, setHasMultiTarget] = useState(false);
  const [isCheckingDetails, setIsCheckingDetails] = useState(true);

  useEffect(() => {
    if (isListLoading || !blueprintsData?.data) return;

    if (blueprintsData.data.length === 0) {
      setIsCheckingDetails(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      try {
        for (const bp of blueprintsData.data) {
          if (cancelled) return;
          const result = await triggerGetBlueprint(
            { id: bp.id },
            true,
          ).unwrap();
          if (result.image_requests.length > 1) {
            setHasMultiTarget(true);
            return;
          }
        }
      } finally {
        if (!cancelled) {
          setIsCheckingDetails(false);
        }
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [blueprintsData, isListLoading, triggerGetBlueprint]);

  return { hasMultiTarget, isLoading: isListLoading || isCheckingDetails };
};

export default useHasMultiTargetBlueprints;
