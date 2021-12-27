var url = 'http://hades-script.com:4000'

if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:4000'
}

export const serverUrl = url;