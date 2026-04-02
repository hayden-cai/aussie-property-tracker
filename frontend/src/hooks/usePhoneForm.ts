import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { requestOTP } from '@/api/auth'
import { normalisePhone } from '@/utils/format'

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Mobile number is required')
    .transform(normalisePhone)
    .refine(
      (val) => /^\+614\d{8}$/.test(val),
      'Enter a valid Australian mobile number (e.g. 0412 345 678)'
    ),
})

interface UsePhoneFormReturn {
  phone: string
  loading: boolean
  error: string | null
  setPhone: (value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function usePhoneForm(): UsePhoneFormReturn {
  const navigate = useNavigate()
  const [phone, setPhoneRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setPhone = useCallback((value: string) => {
    setPhoneRaw(value)
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      const result = phoneSchema.safeParse({ phone })
      if (!result.success) {
        setError(result.error.issues[0].message)
        return
      }

      const normalised = result.data.phone
      setLoading(true)
      try {
        await requestOTP(normalised)
        navigate('/otp', { state: { phone: normalised } })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [phone, navigate]
  )

  return { phone, loading, error, setPhone, handleSubmit }
}
