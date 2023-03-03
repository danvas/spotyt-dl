import difflib
from collections import OrderedDict
from ytmusicapi import YTMusic
import re

VIDEOIDS = {'1Ixa4ZLNWbaMsb6vLnzBKV': ['-komkjack6c',
                            'EpIu4-mSdjc',
                            'GhCOqj4Pyb8',
                            'MuNMsfFkI_M',
                            'SD2uoFC7aEQ',
                            'dUZvBkxTrnk',
                            'VHexTTOdpXE'],
 '1ihoAOte7bTCUbvWxBR3fk': ['_cc19wooVXs', 'Asnb3dU9QaA', 'BTU-lXvhpQI'],
 '1lUT9ZnrWDVbLdnPyzjYIq': ['49g-NTyXlOU',
                            '4GUDX51TxaI',
                            'jOdV9qrBdSk',
                            '090OtZY2zOU',
                            'THLNapJj4ts',
                            'LCYKH0u07Eo',
                            'W8srSl1Dc2M'],
 '1yErlfGE8brAL5ZTo7maBU': ['Mz5dE54peYk',
                            'AQSkkWZC4gM',
                            'KdxIm-TE1ig',
                            'xVhHP5pgmZA',
                            '2Z2UHLoZy1E'],
 '2gDXrWHc7ovpvAauol3PjZ': ['xYmospbu9hY',
                            'Twp4EFT5qfY',
                            'rzmVlG9kWtc',
                            'XG91sxkf3w0',
                            'u4CipUiqaTk',
                            'GXUa3ip8VWg',
                            'IzEmszryIoo'],
 '3bgH7ay0vCi8pqaFq4H9UY': ['3qrMDWq4vfc',
                            '_f2BN9ARogY',
                            '1GNZ3xaMCRk',
                            'f_42Zo5VXKA'],
 '3mbdc8LQR0tCPdV0d3sruO': ['uYj2TCTTFhc',
                            'EjF-e9aiPP0',
                            'Y2gqXvz6dZM',
                            'VcyeZ4TplNw',
                            'mZxlOvkA48Y',
                            'ZVT_U9SG5X8',
                            'P-Sp7Rsti3A'],
 '3s3vybdkzM8sHztxIEQcYr': ['PTZQrwTuJu0',
                            'p_tm_71E8Rg',
                            'FWQixgB9jjg',
                            'KjcYKI8ojEE',
                            'yt6ZfpUhTvs',
                            '2tLstF8DhWs',
                            'kTWTN_uxNcQ'],
 '4dL0IByCuNLmydwMRFokIM': ['IVl8WJdugkU',
                            'Tzok8iknIg0',
                            'vAwDItwZCxY',
                            '6EcNxRYvLVo',
                            '3W7e4LxAvBo',
                            'UMr82fKun6I',
                            'BtNn4l2oj_s'],
 '5MEfxTan4X3PmkETXxOG6e': ['zk178n7InWo',
                            'Vvl1aDr70RQ',
                            'nWcul9EBz-Q',
                            'kiGlr824V0s',
                            'QXmsJ7CZgMk',
                            'NqCiHL9IE4I',
                            '5qRPsiUUnEM'],
 '5gJw9DpcnYywIIVGYSb4Y5': ['VkaTHUAvxI0',
                            'f9hCzrGbdr0',
                            'VO2-jrzaR9g',
                            '9DR1MqA0an8',
                            '5_S8uYJ17Bk',
                            'q_tDyL5f4uI',
                            'o8zCytXWt4M'],
 '6k8oac03vALHfrb9tPuOc7': ['g4q1jLBlQ7o',
                            'A1QuTvc-ovM',
                            'gLAS3Q0CIVQ',
                            'OWmWHZakXRg',
                            'LFDnniEtjnE',
                            '4VzizFv_CqY',
                            'XaCMrutiAmA'],
 '79G1B6sFPHiA1xh4OGWtOz': ['cIbGcvLkriY',
                            'Bq8SOIwhuow',
                            '_xDPw2SmWko',
                            'dZ41hUHexmU',
                            'RaaRPHL5t_g',
                            'T4ysWuq-TaY',
                            '0RFE7U3xGEU'],
 '7J46lkQn2onLYyg4PtJEJk': ['cHh32HPpiKg',
                            '7u6oS6XE2LQ',
                            '_3VrBorxqio',
                            'bonsq7u9EK8',
                            'V1bJ-Zu5Dmo',
                            'cDWbsJPEMRo',
                            'C8jLI2h1jkU'],
 '7hFfYDQIaMlwfMqi6mOCtv': ['_BW4DhQBeds',
                            '4VIWeBGzRfI',
                            'C55RM3JgvZE',
                            'hIEIl4aLJXk',
                            'TdFgXVDv6uM',
                            'nlh9Cm0GOnQ',
                            'qv6AhgNkUVU'],
 '7uECCWx2tz4T102b2QBS0p': ['pGjflK33wnI',
                            '09VGEuBCKvU',
                            '2o4__Chi6nY',
                            'Cxk-QeZ6Rus',
                            'qGU4PnvDvXk',
                            'FBYgeeGfGKM',
                            'ana3uMVlWqU']}

class YTMusicTransfer:
    def __init__(self):
        self.api = YTMusic("headers_auth.json")

    def create_playlist(self, name, info, privacy="PRIVATE", tracks=None):
        return self.api.create_playlist(name, info, privacy, video_ids=tracks)

    def get_best_fit_song_ids(self, results, song):
        match_score = {}
        title_score = {}
        for res in results:
            if res['resultType'] not in ['song', 'video']:
                continue

            durationMatch = None
            if 'duration' in song and 'duration' in res and res['duration']:
                durationItems = res['duration'].split(':')
                duration = int(durationItems[0]) * 60 + int(durationItems[1])
                durationMatch = 1 - abs(duration - song['duration']) * 2 / song['duration']

            title = res['title']
            # for videos,
            artist = ''
            if res['resultType'] == 'video':
                titleSplit = title.split('-')
                if len(titleSplit) == 2:
                    artist, title = titleSplit


            artists = ' '.join([a['name'] for a in res['artists']])
            tscore = difflib.SequenceMatcher(a=title.lower(), b=song['name'].lower()).ratio()
            title_score[res['videoId']] = tscore * 9
            artist_score = difflib.SequenceMatcher(a=artist.lower(), b=song['artist'].lower()).ratio() * 9
            scores = [title_score[res['videoId']],
                      artist_score,
                      difflib.SequenceMatcher(a=artists.lower(), b=song['artist'].lower()).ratio()]
            if durationMatch:
                scores.append(durationMatch * 2)

            #add album for songs only
            # if res['resultType'] == 'song' and res['album'] is not None:
            #     scores.append(difflib.SequenceMatcher(a=res['album']['name'].lower(), b=song['album'].lower()).ratio())

            match_score[res['videoId']] = sum(scores) / len(scores) * max(1, int(res['resultType'] == 'song') * 1.5)
        if len(match_score) == 0:
            return None
        
        return sorted(match_score, key=match_score.get, reverse=True)

    def search_songs(self, tracks):
        video_ids = {}
        songs = list(tracks)
        notFound = list()
        for i, song in enumerate(songs):
            name = re.sub(r' \(feat.*\..+\)', '', song['name'])
            query = song['artist'] + ' ' + name
            query = query.replace(" &", "")
            result = self.api.search(query)
            if len(result) == 0:
                notFound.append(query)
            else:
                targetSongs = self.get_best_fit_song_ids(result, song)
                if targetSongs is None:
                    notFound.append(query)
                else:
                    video_ids[song['id']] = targetSongs

            if i > 0 and i % 10 == 0:
                print(f"YouTube tracks: {i}/{len(songs)}")

        with open('./noresults_youtube.txt', 'w', encoding="utf-8") as f:
            f.write("\n".join(notFound))
            f.write("\n")
            f.close()
        
        return video_ids

    def add_playlist_items(self, playlistId, videoIds):
        videoIds = OrderedDict.fromkeys(videoIds)
        self.api.add_playlist_items(playlistId, videoIds)

    def get_playlist_id(self, name):
        pl = self.api.get_library_playlists(10000)
        try:
            playlist = next(x for x in pl if x['title'].find(name) != -1)['playlistId']
            return playlist
        except:
            raise Exception("Playlist title not found in playlists")

    def remove_songs(self, playlistId):
        items = self.api.get_playlist(playlistId, 10000)
        print("++ Removing all songs from playlist: ", items)
        items = items['tracks']
        if len(items) > 0:
            self.api.remove_playlist_items(playlistId, items)

    def remove_playlists(self, pattern):
        playlists = self.api.get_library_playlists(10000)
        p = re.compile("{0}".format(pattern))
        matches = [pl for pl in playlists if p.match(pl['title'])]
        print("The following playlists will be removed:")
        print("\n".join([pl['title'] for pl in matches]))
        print("Please confirm (y/n):")

        choice = input().lower()
        if choice[:1] == 'y':
            [self.api.delete_playlist(pl['playlistId']) for pl in matches]
            print(str(len(matches)) + " playlists deleted.")
        else:
            print("Aborted. No playlists were deleted.")


def search_videos(tracks):
    ytmusic = YTMusicTransfer()
    video_ids = ytmusic.search_songs(tracks)
    return video_ids