interface Seat {
    displayName: string,
    marked: boolean,
    reserved: boolean,
    by: string // marked = instagramId; reserved = private friend

}

export function createDefaultSeat(name): Seat {
    return {
      displayName: name,
      marked: false,
      reserved: false,
      by: ''
    };
  }
  