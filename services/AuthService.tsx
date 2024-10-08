'use client';
import AxiosInstance from "@/libs/axios";
import OTP from "@/types/OTP";
import User from "@/types/User";

import { TenantMemberService } from "./TenantMemberService";

export class AuthService {
    static changeLanguage(newLanguage: string) {
        throw new Error('Method not implemented.');
    }
    static changeName(newName: string) {
        throw new Error('Method not implemented.');
    }
    static changePhone(newPhone: string) {
        throw new Error('Method not implemented.');
    }
        


    static AxiosInstance: any = AxiosInstance;

    static ZustandStore: any;
    static SecureStore: any;
    static Toast: any;
    static Navigation : any;

    
    static initialize(ZustandStore: any, SecureStore: any, Toast: any) {
        this.ZustandStore = ZustandStore;
        this.SecureStore = SecureStore;
        this.Toast = Toast;


        this.loadFromSecureStore();

    }

    static async loadFromSecureStore() {

        if (!this.SecureStore || !this.ZustandStore) {
            return;
        }

        await this.SecureStore.getItemAsync('token').then(async (token : string | null) => {
            if (token) {
                this.ZustandStore?.useAuthStore.setState({ token });
                this.AxiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;


                const user = await this.fetchUser();

                if (user) {
                    this.Toast.show({
                        type: 'success',
                        text1: 'Welcome back'
                    });
                    this.Navigation.navigate('Settings');
                } else {
                    this.Toast.show({
                        type: 'error',
                        text1: 'Session expired'
                    });
                    this.Navigation.navigate('Login');
                }
            }
        });


        /*
        await this.SecureStore.getItemAsync('user').then((user : string | null) => {
            if (user) {
                this.ZustandStore?.useAuthStore.setState({ user: JSON.parse(user) });
            }

            this.fetchUser();
        });
       

        await this.SecureStore.getItemAsync('otp').then((otp : string | null) => {
            if (otp) {
                this.ZustandStore?.useAuthStore.setState({ otp: JSON.parse(otp) });
            }
        }); 
        
        console.log(this.ZustandStore.useAuthStore.getState().token);

        */
    
    }

    static async saveToSecureStore() {

        if (!this.SecureStore || !this.ZustandStore) {
            return;
        }

        this.SecureStore.setItemAsync('token', this.ZustandStore.useAuthStore.getState().token);
        this.SecureStore.setItemAsync('user', JSON.stringify(this.ZustandStore.useAuthStore.getState().user));
        this.SecureStore.setItemAsync('otp', JSON.stringify(this.ZustandStore.useAuthStore.getState().otp));
    }


    static async wait(seconds: number) {
        return new Promise((resolve) => {
            setTimeout(() => {

            }, seconds * 1000);
        });
    }

   
    static async login(email: string, password: string): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/login', { email, password })

        if (response.data) {
            this.ZustandStore.useAuthStore.setState({ token: response.data.token, user: response.data.user, otp: response.data.OTP });
            console.log("Login successful");
            await this.saveToSecureStore();
        }


        return response.data;   
    }

    static async flush(): Promise<any> {
        this.ZustandStore.useAuthStore.setState({ token: null, user: null, otp: null });
        this.AxiosInstance.defaults.headers.common['Authorization'] = '';
        this.SecureStore.deleteItemAsync('token');
        this.SecureStore.deleteItemAsync('user');
        this.SecureStore.deleteItemAsync('otp');

        //Flush services
        TenantMemberService.flush();
    }

    static async logout(): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/logout').catch((error: any) => {
            return null;
        });

        return response.data;
    }

    static async register(email: string, password: string): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/register', { email, password }).catch((error: any) => {
            return null;
        });

        return response.data;   
    }

    static async sendEmailOTP(token: string): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/otp/email-send', { token: token }).catch((error: any) => {
            return null;
        });
        return response.data;   
    }

    static async sendPhoneOTP(token: string): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/otp/phone-send', { token: token }).catch((error: any) => {
            return null;
        });
        return response.data;
    }

    static async verifyEmailOTP(token: string, code: string): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/otp/email-verify', { token: token, code }).catch((error: any) => {
            return null;
        });
        return response.data;
    }

    static async verifyPhoneOTP(token: string, code: string): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/otp/phone-verify', { token: token, code }).catch((error: any) => {
            return null;
        });
        return response.data;
    }

    static async changeEmail(email: string): Promise<any> {
        const response = await this.AxiosInstance.post('/v1/auth/change-email', { email }).catch((error: any) => {
            return null;
        });
        return response.data;
    }

    static async fetchUser(): Promise<User | null> {
        const response = await this.AxiosInstance.get('/v1/auth/me').catch((error: any) => {
            console.log("fetchUser error", error);
            return null;
        });

        if (!response) {
            return null;
        }

        this.ZustandStore.useAuthStore.setState({ user: response.data });

        return response.data;
    }

    static async listAllSessionsByUser(): Promise<any> {
        const response = await this.AxiosInstance.get('/v1/auth/sessions').catch((error: any) => {
            return null;
        });

        return response.data;
    }

    static async revokeAllSessions(): Promise<any> {
        const response = await this.AxiosInstance.delete('/v1/auth/sessions').catch((error: any) => {
            return null;
        });

        this.logout();

        return response.data;
    }

    static async revokeSession(sessionId: string): Promise<any> {
        const response = await this.AxiosInstance.delete('/v1/auth/sessions/' + sessionId).catch((error: any) => {
            return null;
        });

        return response.data;
    }

    
}

