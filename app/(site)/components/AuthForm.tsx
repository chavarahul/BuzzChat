'use client'
import Button from '@/app/components/Button';
import Input from '@/app/components/inputs/Input';
import React, { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import AuthSocialButton from './AuthSocialButton';
import { BsGithub, BsGoogle } from 'react-icons/bs';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

type Variant = 'LOGIN' | 'REGISTER';
const AuthForm = () => {
    const [variant, setVariant] = useState<Variant>('LOGIN');
    const [loading, setLoading] = useState<boolean>(false);

    const toogleVariant = useCallback(() => {
        if (variant === 'LOGIN') {
            setVariant('REGISTER');
        } else { setVariant('LOGIN'); }
    }, [variant])

    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setLoading(true);
        if (variant === 'REGISTER') {  
           axios.post('/api/register',data)
        } if (variant === 'LOGIN') {

            signIn('credentials',{...data,redirect:false}).then((call)=>{
                if(call?.error) toast.error("Invalid Credentials");
                if(call?.ok) toast.error("Logged in!");

            }).finally(()=>{setLoading(false)})

        }
    }
    const socialAction = (action: string) => {
        setLoading(true);

        signIn(action,{redirect:false}).then((call)=>{
            if(call?.error) toast.error("Invalid Credentials");
            if(call?.ok) toast.error("Logged in!");

        }).finally(()=>{setLoading(false)})
    }
    return (
        <div className='mt-8 sm:mx-auto  sm:max-w-md sm:w-full'>
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                    {variant === 'REGISTER' && (
                        <Input id="name" label='Name' register={register} errors={errors} type='text' />
                    )}
                    <Input id="email" label='Email' register={register} errors={errors} type='email' />
                    <Input id="password" label='Password' register={register} errors={errors} type='password' />
                    <div className="">
                        <Button disabled={loading} fullWidth type='submit'>
                            {variant === 'REGISTER' ? 'Register' : "Login"}
                        </Button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" ></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className='bg-white px-2 text-gray-500'>
                                Or Continue with
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton icon={BsGithub} onClick={() => socialAction('github')} />
                        <AuthSocialButton icon={BsGoogle} onClick={() => socialAction('google')} />
                    </div>
                </div>
                <div className='flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500'>
                    <div>
                        {variant === 'LOGIN' ? 'New to BuzzChat' : "Already have an account?"}

                    </div>
                    <div onClick={toogleVariant} className="underline cursor-pointer">
                        {variant === 'LOGIN' ? 'Create an account' : 'Login  '}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthForm