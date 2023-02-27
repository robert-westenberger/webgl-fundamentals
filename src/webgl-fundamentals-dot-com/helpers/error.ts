export function error(msg: string) {
    if (window.console) {
      if (window.console.error) {
        window.console.error(msg);
      } else if (window.console.log) {
        window.console.log(msg);
      }
    }
  }
