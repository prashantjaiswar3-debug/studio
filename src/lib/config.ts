import config from '../../streamweaver.config.json';

interface AppConfig {
    defaultPlaylistUrls: string[];
}

export const getConfig = (): AppConfig => {
    return config;
};
