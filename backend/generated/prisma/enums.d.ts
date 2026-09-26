export declare const Role: {
    readonly EMPLOYEE: "EMPLOYEE";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
