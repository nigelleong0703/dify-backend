import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import style from '../page.module.css'
import Button from '@/app/components/base/button'
import { API_PREFIX } from '@/config'
import classNames from '@/utils/classnames'
import { getPurifyHref } from '@/utils'

type SocialAuthProps = {
  disabled?: boolean
}

export default function SocialAuth(props: SocialAuthProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [availableProviders, setAvailableProviders] = useState<{ github: boolean; google: boolean }>({
    github: true,
    google: true,
  })
  const [checkedProviders, setCheckedProviders] = useState(false)

  const getOAuthLink = (href: string) => {
    const url = getPurifyHref(`${API_PREFIX}${href}`)
    if (searchParams.has('invite_token'))
      return `${url}?${searchParams.toString()}`

    return url
  }

  useEffect(() => {
    let isCancelled = false

    const checkProvider = async (provider: 'github' | 'google') => {
      try {
        const response = await fetch(getOAuthLink(`/oauth/login/${provider}`), {
          method: 'GET',
          redirect: 'manual',
          credentials: 'include',
        })
        // opaqueredirect occurs on cross-origin 302; treat as available
        const isRedirect = (response.status >= 300 && response.status < 400) || response.type === 'opaqueredirect'
        // backend returns 400 when not configured
        return isRedirect
      }
      catch (e) {
        console.error(`Failed to check ${provider} OAuth availability`, e)
        return true // default to showing the button on error
      }
    }

    const run = async () => {
      const [githubAvailable, googleAvailable] = await Promise.all([
        checkProvider('github'),
        checkProvider('google'),
      ])
      if (!isCancelled) {
        setAvailableProviders({ github: githubAvailable, google: googleAvailable })
        setCheckedProviders(true)
      }
    }

    void run()

    return () => {
      isCancelled = true
    }
  }, [])

  if (checkedProviders && !availableProviders.github && !availableProviders.google)
    return null

  return <>
    {availableProviders.github && <div className='w-full'>
      <a href={getOAuthLink('/oauth/login/github')}>
        <Button
          disabled={props.disabled}
          className='w-full'
        >
          <>
            <span className={
              classNames(
                style.githubIcon,
                'mr-2 h-5 w-5',
              )
            } />
            <span className="truncate leading-normal">{t('login.withGitHub')}</span>
          </>
        </Button>
      </a>
    </div>}
    {availableProviders.google && <div className='w-full'>
      <a href={getOAuthLink('/oauth/login/google')}>
        <Button
          disabled={props.disabled}
          className='w-full'
        >
          <>
            <span className={
              classNames(
                style.googleIcon,
                'mr-2 h-5 w-5',
              )
            } />
            <span className="truncate leading-normal">{t('login.withGoogle')}</span>
          </>
        </Button>
      </a>
    </div>}
  </>
}
