import { CameraControls, PerspectiveCamera } from '@react-three/drei'

const CustomCamera: React.FC = () => {

    return (

        <>
            <CameraControls
                enabled={true}
            >
            </CameraControls>
            <PerspectiveCamera makeDefault position={[0, 0, 150]}
            />
        </>
    )
}

export { CustomCamera }
