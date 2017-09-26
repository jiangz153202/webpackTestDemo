const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const url = require('url');



module.exports = (options = {}) => {
    const config = require('./config/' + (process.env.npm_config_config || options.config || 'default'))
    return {
        entry:{
            vendor:'./src/vendor',
            index:'./src/index'
        },
        output:{
            path : resolve(__dirname,'dist'),
            filename: options.dev ? '[name].js' : '[name].js?[chunkhash]',
            publicPath:'/assets/',
             /*
            import()加载的文件会被分开打包, 我们称这个包为chunk, chunkFilename用来配置这个chunk输出的文件名.
    
            [id]: 编译时每个chunk会有一个id.
            [chunkhash]: 这个chunk的hash值, 文件发生变化时该值也会变. 文件名加上该值可以防止浏览器读取旧的缓存文件.
            */
            chunkFilename: '[id].js?[chunkhash]'
        },
        module:{
            rules:[
                {
                    test:/\.js$/,
                    exclude:/node_modules/,
                    use:[
                        'babel-loader',
                        'eslint-loader'
                       
                    ]
                },
                //匹配HTML文件
                {
                    test:/\.html$/,
                    use:[
                        {
                            loader:'html-loader',
                            options:{
                                attrs:['img:src','link:href']
                            }
                        }
                    ]
                   
                },
                {
                    test:/favicon.png$/,
                    use:[
                        {
                            loader:'file-loader',
                            options:{
                                name:'[name].[ext]?[hash]'
                            }
                        }
                    ]
                },
                {
                    test:/\.css$/,
                    use:[
                        'style-loader',
                        'css-loader'
                    ]
                },
                {
                    /*
                    匹配各种格式的图片和字体文件
                    上面html-loader会把html中<img>标签的图片解析出来, 文件名匹配到这里的test的正则表达式,
                    css-loader引用的图片和字体同样会匹配到这里的test条件
                    */
                    test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
            
                    /*
                    使用url-loader, 它接受一个limit参数, 单位为字节(byte)
            
                    当文件体积小于limit时, url-loader把文件转为Data URI的格式内联到引用的地方
                    当文件大于limit时, url-loader会调用file-loader, 把文件储存到输出目录, 并把引用的文件路径改写成输出后的路径
            
                    比如 views/foo/index.html中
                    <img src="smallpic.png">
                    会被编译成
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAA...">
            
                    而
                    <img src="largepic.png">
                    会被编译成
                    <img src="/f78661bef717cf2cc2c2e5158f196384.png">
                    */
                    // 排除favicon.png, 因为它已经由上面的loader处理了. 如果不排除掉, 它会被这个loader再处理一遍
                    exclude: /favicon.png$/,
                    use: [
                      {
                        loader: 'url-loader',
                        options: {
                          limit: 10000
                        }
                      }
                    ]
                }
            ]
        },
         /*
        配置webpack插件
        plugin和loader的区别是, loader是在import时根据不同的文件名, 匹配不同的loader对这个文件做处理,
        而plugin, 关注的不是文件的格式, 而是在编译的各个阶段, 会触发不同的事件, 让你可以干预每个编译阶段.
        */
        plugins:[
            new HtmlWebpackPlugin({
                template: __dirname +'/src/index.html'
            }),
            new webpack.optimize.CommonsChunkPlugin({
                names:['vendor','manifest']
            })
        ],
        devtool:"eval-source-map",
        devServer: config.devServer ?{
            host:'0.0.0.0',
            port:config.devServer.port,
            porxy:config.devServer.proxy,
            historyApiFallback:{
                index:url.parse(config.publicPath).pathname,
                disableDotRule:true
            }
        }:undefined,
        performance: {
            hints: options.dev ? false : 'warning'
        }
    }
}