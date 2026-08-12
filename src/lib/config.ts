/**
 * 全局配置
 */

export interface MetingSong {
    name: string;
    artist: string;
    url: string;
    pic: string;
}

/** Meting API 服务列表（按优先级依次尝试） */
export const METING_SERVERS: string[] = [
    'https://api.injahow.cn/meting/',
    'https://api.moeyao.cn/meting/'
];

/** 音乐平台 */
export const METING_SERVER: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu' = 'netease';

/** 歌单 ID */
export const METING_PLAYLIST_ID = '10046455237';

/** 本地备用音乐（Meting 全部失败时使用） */
export const LOCAL_MUSIC_URL = 'assets/music/bgm.mp3';

/** 本地备用封面（Meting 全部失败时使用） */
export const LOCAL_COVER_URL = 'assets/images/memory-1.avif';

/** 歌曲切到下一首 */
export const AUTO_NEXT_SONG = true;

/** Waline 评论服务地址（自建后端，留空则禁用评论） */
export const WALINE_SERVER_URL = 'https://waline.520781.xyz/';

/** 记忆画廊：自动播放间隔（毫秒） */
export const GALLERY_AUTO_PLAY_INTERVAL = 2500;

/** 记忆画廊：非当前卡片缩放比例 */
export const GALLERY_INACTIVE_SCALE = 0.82;
