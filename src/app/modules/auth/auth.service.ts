import {Injectable} from '@angular/core';
import {AuthConfig, NullValidationHandler, OAuthService} from 'angular-oauth2-oidc';
import {filter} from 'rxjs/operators';

@Injectable()
export class AuthConfigService {
    // tslint:disable-next-line:variable-name
    private _decodedAccessToken: any;
    // tslint:disable-next-line:variable-name
    private _decodedIDToken: any;

    get decodedAccessToken(): any {
        return this._decodedAccessToken;
    }

    get decodedIDToken(): any {
        return this._decodedIDToken;
    }

    constructor(
        private readonly oauthService: OAuthService,
        private readonly authConfig: AuthConfig
    ) {
    }

    async initAuth(): Promise<any> {
        return new Promise<void>((resolveFn, rejectFn) => {
            // setup oauthService
            this.oauthService.configure(this.authConfig);
            this.oauthService.setStorage(localStorage);
            this.oauthService.tokenValidationHandler = new NullValidationHandler();

            // subscribe to token events
            this.oauthService.events
                .pipe(
                    filter((e: any) => {
                        return e.type === 'token_received';
                    })
                )
                .subscribe(() => this.handleNewToken());

            // continue initializing app or redirect to login-page
            this.oauthService.loadDiscoveryDocumentAndLogin().then((isLoggedIn) => {
                if (isLoggedIn) {
                    this.oauthService.setupAutomaticSilentRefresh();
                    resolveFn();
                } else {

                    this.oauthService.initImplicitFlow();
                    rejectFn();
                }
            });
        });
    }

    private handleNewToken(): void {
        this._decodedAccessToken = this.oauthService.getAccessToken();
        this._decodedIDToken = this.oauthService.getIdToken();
    }
}
