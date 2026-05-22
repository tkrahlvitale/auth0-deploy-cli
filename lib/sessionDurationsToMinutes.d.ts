type SessionDurations = {
    session_lifetime_in_minutes?: number;
    idle_session_lifetime_in_minutes?: number;
    ephemeral_session_lifetime_in_minutes?: number;
    idle_ephemeral_session_lifetime_in_minutes?: number;
};
export declare function sessionDurationsToMinutes({ session_lifetime, idle_session_lifetime, ephemeral_session_lifetime, idle_ephemeral_session_lifetime, }?: {
    session_lifetime?: number;
    idle_session_lifetime?: number;
    ephemeral_session_lifetime?: number;
    idle_ephemeral_session_lifetime?: number;
}): SessionDurations;
export default sessionDurationsToMinutes;
