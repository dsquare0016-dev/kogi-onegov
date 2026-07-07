/**
 * useDbLgas - Fetches LGA list from PostgreSQL (kogi_erp_test.lgas)
 * useDbNigerianStates - Fetches Nigerian states list
 *
 * These hooks are the single source of truth for LGA and State dropdowns
 * across the entire ERP. No hardcoded lists anywhere.
 */
import { useState, useEffect } from 'react';

export type LgaOption = { id: string; name: string; headquarters: string | null; code: string | null; status: string };
export type StateOption = { id: string; state_name: string; state_code: string | null; capital: string | null };

let _lgaCache: LgaOption[] | null = null;
let _stateCache: StateOption[] | null = null;

export function useDbLgas() {
  const [lgas, setLgas] = useState<LgaOption[]>(_lgaCache || []);
  const [loading, setLoading] = useState(!_lgaCache);

  useEffect(() => {
    if (_lgaCache) {
      setLgas(_lgaCache);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const { dbGetLgas } = await import('./postgres-service');
        const data = await dbGetLgas();
        const active = data.filter((l: any) => l.status !== 'Inactive');
        _lgaCache = active;
        setLgas(active);
      } catch (err) {
        console.error('useDbLgas error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { lgas, loading };
}

export function useDbNigerianStates() {
  const [states, setStates] = useState<StateOption[]>(_stateCache || []);
  const [loading, setLoading] = useState(!_stateCache);

  useEffect(() => {
    if (_stateCache) {
      setStates(_stateCache);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const { dbGetNigerianStates } = await import('./postgres-service');
        const data = await dbGetNigerianStates();
        _stateCache = data;
        setStates(data);
      } catch (err) {
        console.error('useDbNigerianStates error:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { states, loading };
}

/** Clears the in-memory cache — call this after LGA/State edits */
export function invalidateLgaCache() { _lgaCache = null; }
export function invalidateStateCache() { _stateCache = null; }
