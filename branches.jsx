import React from 'react';
import configs from './styleConfigs';
import { Transition } from 'react-transition-group'

export default class Branches extends React.Component {
    constructor(props){
        super(props);
    }

    renderOwnConnex(){
        const { finalIdxs } = this.props;
        const finalChild = finalIdxs[finalIdxs.length - 1];

        return (
            <>  
                <Transition 
                    in={this.props.expanded}
                    unmountOnExit
                    mountOnEnter
                    timeout={configs.ANIMATION_DURATION}
                >
                        <div style={{
                                height: (configs.ROW_HEIGHT - configs.ICON_SIZE)/2,
                                position: 'absolute',
                                left: configs.LEFT_MARGIN + configs.INDENT*(this.props.depth-1) + configs.ICON_SIZE/2,
                                bottom: 0,
                                width: 5,
                                borderLeft: configs.TREE_LINES
                            }}
                        />
                </Transition>

                { !!finalIdxs.length &&
                    <div 
                        style={{
                            position: 'absolute',
                            bottom: '50%',
                            borderLeft: configs.TREE_LINES,
                            borderBottom: configs.TREE_LINES,
                            width: configs.INDENT - configs.ICON_SIZE/2,
                            left: configs.INDENT * (this.props.depth-2) + configs.LEFT_MARGIN + configs.ICON_SIZE/2,
                            height: '50%'
                        }}
                />
                }
                { !finalChild && (
                    <div 
                        style={{
                            position: 'absolute',
                            bottom: '0%',
                            borderLeft: configs.TREE_LINES,
                            width: configs.INDENT - configs.ICON_SIZE/2,
                            left: configs.INDENT * (this.props.depth-2) + configs.LEFT_MARGIN + configs.ICON_SIZE/2,
                            height: '50%'
                        }}
                    />
                )}
            </>
        )
    }

    renderPrevConnex(){
        return this.props.finalIdxs.slice(0,-1).map((final,i) => {
            if (final) return null;
            return (
                <div 
                    key={i}
                    style={{
                        height: '100%', 
                        width: 5,
                        position: 'absolute',
                        borderLeft: configs.TREE_LINES,
                        top: 0,
                        left: configs.LEFT_MARGIN + configs.ICON_SIZE/2 + configs.INDENT * i,
                    }}
                />
            )
        })
    }

    render(){
        return (
            <>
                { this.renderOwnConnex() }   
                { this.renderPrevConnex() } 
            </>
        )
    }
}