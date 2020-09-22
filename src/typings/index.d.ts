declare const __wxConfig

declare const EnvConfig = {
  env: string
}

// Uni Types 扩展
declare namespace UniApp {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface UniExpand extends Uni {
    // 获取当前的地理位置、速度
    getLocation(options: GetLocationOptionsExpand): void;

    // 打开地图选择位置
    chooseLocation(options: ChooseLocationOptionsExpand): void;
  }

  interface GetLocationOptionsExpand extends UniApp.GetLocationOptions {
    // 开启高精度定位
    isHighAccuracy?: boolean;
    // 高精度定位超时时间(ms)，指定时间内返回最高精度，该值3000ms以上高精度定位才有效果
    highAccuracyExpireTime?: number;
  }

  interface ChooseLocationOptionsExpand extends UniApp.ChooseLocationOptions {
    // 目标地纬度
    latitude?: number;
    // 目标地经度
    longitude?: number;
  }
}

declare const uni: UniApp.UniExpand
