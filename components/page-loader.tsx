"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

const BG_COLOR = "#000000"
const ACCENT_COLOR = 0xff2c03
const WHITE = 0xff2c03

export function PageLoader() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!wrapRef.current) return

    const canvassize = 500
    const length = 30
    const radius = 5.6
    const rotatevalue = 0.035
    const pi2 = Math.PI * 2

    let acceleration = 0
    let animatestep = 0
    let toend = false
    let rafId: number

    const group = new THREE.Group()

    const camera = new THREE.PerspectiveCamera(65, 1, 1, 10000)
    camera.position.z = 150

    const scene = new THREE.Scene()
    scene.add(group)

    // Torus knot curve
    class KnotCurve extends THREE.Curve<THREE.Vector3> {
      getPoint(percent: number): THREE.Vector3 {
        const x = length * Math.sin(pi2 * percent)
        const y = radius * Math.cos(pi2 * 3 * percent)
        let t = (percent % 0.25) / 0.25
        t = (percent % 0.25) - (2 * (1 - t) * t * -0.0185 + t * t * 0.25)
        if (Math.floor(percent / 0.25) === 0 || Math.floor(percent / 0.25) === 2) {
          t *= -1
        }
        const z = radius * Math.sin(pi2 * 2 * (percent - t))
        return new THREE.Vector3(x, y, z)
      }
    }

    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(new KnotCurve(), 200, 1.1, 2, true),
      new THREE.MeshBasicMaterial({ color: WHITE })
    )
    group.add(mesh)

    const ringcover = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 15, 1),
      new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true })
    )
    ringcover.position.x = length + 1
    ringcover.rotation.y = Math.PI / 2
    group.add(ringcover)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.3, 5.55, 32),
      new THREE.MeshBasicMaterial({ color: ACCENT_COLOR, opacity: 0, transparent: true })
    )
    ring.position.x = length + 1.1
    ring.rotation.y = Math.PI / 2
    group.add(ring)

    // Fake shadow
    for (let i = 0; i < 10; i++) {
      const plain = new THREE.Mesh(
        new THREE.PlaneGeometry(length * 2 + 1, radius * 3, 1),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.13 })
      )
      plain.position.z = -2.5 + i * 0.5
      group.add(plain)
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(canvassize, canvassize)
    renderer.setClearColor(BG_COLOR)
    wrapRef.current.appendChild(renderer.domElement)

    function easing(t: number, b: number, c: number, d: number) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t + b
      return (c / 2) * ((t -= 2) * t * t + 2) + b
    }

    function render() {
      animatestep = Math.max(0, Math.min(240, toend ? animatestep + 1 : animatestep - 4))
      acceleration = easing(animatestep, 0, 1, 240)

      if (acceleration > 0.35) {
        const progress = (acceleration - 0.35) / 0.65
        group.rotation.y = (-Math.PI / 2) * progress
        group.position.z = 50 * progress
        const p2 = Math.max(0, (acceleration - 0.97) / 0.03)
        ;(mesh.material as THREE.MeshBasicMaterial).opacity = 1 - p2
        ;(ringcover.material as THREE.MeshBasicMaterial).opacity = p2
        ;(ring.material as THREE.MeshBasicMaterial).opacity = p2
        ring.scale.x = ring.scale.y = 0.9 + 0.1 * p2
      }

      renderer.render(scene, camera)
    }

    function animate() {
      mesh.rotation.x += rotatevalue + acceleration
      render()
      rafId = requestAnimationFrame(animate)
    }

    function onStart() { toend = true }
    function onEnd() { toend = false }

    document.body.addEventListener("mousedown", onStart)
    document.body.addEventListener("touchstart", onStart)
    document.body.addEventListener("mouseup", onEnd)
    document.body.addEventListener("touchend", onEnd)

    animate()

    // Auto-dismiss após 2.8s
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setVisible(false), 600)
    }, 2800)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(rafId)
      document.body.removeEventListener("mousedown", onStart)
      document.body.removeEventListener("touchstart", onStart)
      document.body.removeEventListener("mouseup", onEnd)
      document.body.removeEventListener("touchend", onEnd)
      renderer.dispose()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={{
        transition: "opacity 0.6s ease",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "auto",
      }}
    >
      <div
        ref={wrapRef}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </div>
  )
}
