import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { householdChannel, supabase } from './supabase.js'

/**
 * Hogar de la persona actual + perfiles de ambas.
 * data = { household, me, partner, members } o null si aún no pertenece a uno.
 */
export function useHousehold(userId) {
  return useQuery({
    queryKey: ['household', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data: membership, error } = await supabase
        .from('household_members')
        .select('household_id, role, households (id, name, invite_code)')
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      if (!membership) return null

      const { data: members, error: e2 } = await supabase
        .from('household_members')
        .select('role, profiles (id, display_name, color, avatar_url)')
        .eq('household_id', membership.household_id)
      if (e2) throw e2

      const profiles = members.map((m) => ({ ...m.profiles, role: m.role }))
      return {
        household: membership.households,
        me: profiles.find((p) => p.id === userId),
        partner: profiles.find((p) => p.id !== userId) ?? null,
        members: profiles,
      }
    },
  })
}

/** Refresca el hogar cuando la otra persona se une (cambia household_members). */
export function useHouseholdRealtime(householdId, userId) {
  const qc = useQueryClient()
  const [online, setOnline] = useState([])

  useEffect(() => {
    if (!householdId) return
    const channel = householdChannel(householdId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'household_members', filter: `household_id=eq.${householdId}` }, () =>
        qc.invalidateQueries({ queryKey: ['household', userId] }),
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnline(Object.values(state).flat().map((p) => p.user_id))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await channel.track({ user_id: userId, at: Date.now() })
      })
    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, userId, qc])

  return online
}

export function useCreateHousehold(userId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ displayName, name }) => {
      await updateName(userId, displayName)
      const { error } = await supabase.rpc('create_household', { p_name: name || 'Nuestro nido' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['household', userId] }),
  })
}

export function useJoinHousehold(userId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ displayName, code }) => {
      await updateName(userId, displayName)
      const { error } = await supabase.rpc('join_household', { p_code: code })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['household', userId] }),
  })
}

async function updateName(userId, displayName) {
  if (!displayName?.trim()) return
  const { error } = await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', userId)
  if (error) throw error
}
