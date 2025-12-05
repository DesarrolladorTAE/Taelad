import {Link} from "react-router-dom"
import {useEffect, useRef} from 'react'


const BackToTop = () => {

    const backToTop = useRef<HTMLAnchorElement>(null);

    useEffect(() => {

        window.onscroll = function () {
            if (backToTop.current != null) {
                if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                    backToTop.current.style.display = "block";
                } else {
                    backToTop.current.style.display = "none";
                }
            }
        };
    }, [])

    const topFunction = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    return (
        <Link to="#" onClick={topFunction} className="back-to-top-btn btn btn-gradient-primary" id="back-to-top"
              ref={backToTop}><i
            className="mdi mdi-chevron-up"></i></Link>
    )
}

export default BackToTop
